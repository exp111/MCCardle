import argparse
import json
import os
from hashlib import sha256
from typing import TypedDict

import requests


class OutputCard:
  code: str
  cost: str
  type: str
  faction: str
  name: str
  name_de: str
  resources: list[str]
  packs: list[str]
  traits: list[str]
  img: str
  year: int
  health: int
  attack: int
  thwart: int


class Card(TypedDict, total=False):
  pack_code: str
  pack_name: str
  pack_legacy: bool
  type_code: str
  type_name: str
  faction_code: str
  faction_name: str
  position: int
  code: str
  name: str
  real_name: str
  subname: str
  cost: int
  cost_per_hero: bool
  cost_star: bool
  text: str
  real_text: str
  quantity: int
  resource_energy: int
  health: int
  health_per_group: bool
  health_per_hero: bool
  attack: int
  attack_cost: int
  base_threat_fixed: bool
  base_threat_per_group: bool
  escalation_threat_fixed: bool
  duplicated_by: bool | None
  duplicate_of_code: str | None
  threat_fixed: bool
  threat_per_group: bool
  deck_limit: int
  traits: str
  real_traits: str
  is_unique: bool
  hidden: bool
  permanent: bool
  double_sided: bool
  octgn_id: str
  attack_star: bool
  thwart_star: bool
  defense_star: bool
  health_star: bool
  recover_star: bool
  scheme_star: bool
  boost_star: bool
  threat_star: bool
  escalation_threat_star: bool
  url: str
  imagesrc: str
  card_set_type_name_code: str


def directory(raw_path: str):
  raw_path = raw_path.replace("\"", "").replace("'", "").strip()
  if not os.path.isdir(raw_path):
    raise argparse.ArgumentTypeError('"{}" is not an existing directory'.format(raw_path))
  return os.path.abspath(raw_path)


parser = argparse.ArgumentParser(
  prog='Marvel Champions Cardle Data Fetcher',
  description='Compiles the data for MCCardle from the Marvel Champions JSON Repo')
parser.add_argument("-v", "--verbose", action="store_true", help="Show verbose output")  # flag
parser.add_argument("-c", "--cache", action="store_true", help="Cache request files")  # flag
parser.add_argument("-o", "--output", nargs="?", default=os.path.curdir, type=directory,
                    help="The directory where the output is written to. Defaults to the current path.")
args = parser.parse_args()
# args
verbose = args.verbose
cache = args.cache
outputDir = args.output


def vprint(text: str):
  if verbose:
    print(text)


def write(text: str = "", out=None):
  print(text, file=out)
  vprint(text)


vprint("Args:")
vprint(args)

# consts
apiUrl = "https://marvelcdb.com/api/public/cards/"
langApiUrl = "https://de.marvelcdb.com/api/public/cards/"
packApiUrl = "https://marvelcdb.com/api/public/packs/"


def fetchJson(url):
  # first 16 chars of hash
  hashed_name = f"{sha256(url.encode()).hexdigest()[:16]}.json"
  # read cached file if available
  if cache and os.path.exists(hashed_name):
    with open(hashed_name, "r") as f:
      return json.loads(f.read())
  data = requests.get(url).json()
  # write to cached file
  if cache:
    with open(hashed_name, "w") as f:
      f.write(json.dumps(data))
  return data

vprint("Fetching data")
dbData = fetchJson(apiUrl)
langDbData = fetchJson(langApiUrl)
packDbData = fetchJson(packApiUrl)

vprint(f"Loaded {len(dbData)} cards.")
vprint(f"Loaded {len(langDbData)} translated cards.")
vprint(f"Loaded {len(packDbData)} packs.")


def getTranslatedCardName(card: Card):
  c = list(filter(lambda c: c.get("code") == card.get("code"), langDbData))
  if len(c) > 0:
    return c[0].get("name") or card.get("name")
  else:
    return ""


def getResources(card: Card):
  ret = []
  if card.get("resource_energy") is not None:
    ret = ret + (["e"] * card.get("resource_energy"))
  if card.get("resource_mental") is not None:
    ret = ret + (["m"] * card.get("resource_mental"))
  if card.get("resource_physical") is not None:
    ret = ret + (["p"] * card.get("resource_physical"))
  if card.get("resource_wild") is not None:
    ret = ret + (["w"] * card.get("resource_wild"))
  return ret


def hasUnmarkedDuplicate(c: Card):
  # ignore marked duplicate
  if c.get("duplicate_of_code") is not None:
    return None
  # check if any other card matches these parameters: name, cost, faction, type, subname. then its probably a reprint that isn't marked properly
  filtered = list(filter(
    lambda x: x.get("code") != c.get("code") and x.get("name") == c.get("name") and x.get("cost") == c.get(
      "cost") and x.get("faction_code") == c.get("faction_code") and x.get("type_code") == c.get("type_code") and x.get(
      "subname") == c.get("subname"), dbData))
  return filtered[0] if len(filtered) > 0 else None


vprint("Sorting cards by code")
dbData.sort(key=lambda x: x.get('code'))

vprint("Collecting output")
output: dict[str, OutputCard] = {}
duplicates: list[Card] = []
for card in dbData:
  if card.get("card_set_type_name_code") in ["villain", "nemesis", "standard", "expert", "modular", "leader", "evidence", "main_scheme"]:
    continue

  # skip encounter/campaign cards
  if card.get("faction_code") in ["encounter", "campaign"]:
    continue

  # skip identity cards
  if card.get("type_code") in ["hero", "alter_ego"]:
    continue

  # skip hidden cards (mostly used for backsides like 3 form heroes or campaign upgrades)
  if card.get("hidden"):
    continue

  # is reprint, add later to packs
  if card.get("duplicate_of_code") is not None:
    duplicates.append(card)
    continue

  # check for unmarked duplicates (ie in hero packs). add those as duplicates if the other card was already added
  cardDuplicate = hasUnmarkedDuplicate(card)
  if cardDuplicate is not None and cardDuplicate.get("code") in output:
    card["duplicate_of_code"] = cardDuplicate.get("code")
    print(
      f"Card is duplicate {card.get("name")} ({card.get("code")}) of {cardDuplicate.get("name")} ({cardDuplicate.get("code")})")
    duplicates.append(card)
    continue

  dbCard = list(filter(lambda x: x.get("code") == card.get("code"), dbData))
  if dbCard is None or len(dbCard) == 0:
    print(f"Card {card.get("code")} not found in DB data.")
    continue
  dbCard = dbCard[0]

  # create ouput
  output[card.get("code")] = {
    "code": card.get("code"),
    "cost": card.get("cost"),
    "type": card.get("type_code"),
    "faction": card.get("faction_code"),
    "name": card.get("name"),
    "name_de": getTranslatedCardName(card),
    "resources": getResources(card),
    "packs": [card.get("pack_code")],
    "health": card.get("health"),
    "attack": card.get("attack"),
    "thwart": card.get("thwart"),
    # split by ., then strip whitespace. as traits always end with . also remove empty strings afterwards
    # replaces shield so the trait isnt split up
    "traits": list(filter(lambda s: s.strip(), map(lambda s: s.strip(),
                                                   card.get("traits").replace("S.H.I.E.L.D", "SHIELD").split(
                                                     ".") if card.get("traits") is not None else []))),
    "img": dbCard["imagesrc"] if dbCard and "imagesrc" in dbCard else None
  }

vprint("Adding reprints")
# add reprints to packs
for duplicate in duplicates:
  origCode: str = duplicate.get("duplicate_of_code")
  if origCode not in output:
    print(
      f"Missing card {origCode} for duplicate {duplicate.get('code')}. May be an encounter card (like pvp set)? Skipping.")
    continue
  if duplicate.get("pack_code") not in output[origCode]["packs"]:
    output[origCode]["packs"].append(duplicate.get("pack_code"))

vprint("Adding years")
# add first release year of the card to the output. get it from the pack data
for code, card in output.items():
  output[code]["year"] = min(
    [int(pack.get("available").split("-")[0]) for pack in packDbData if pack.get("code") in card["packs"]])

vprint("Starting writing")
# write to file
fileName = "cards.json"
outputPath = os.path.join(outputDir, fileName)
with open(outputPath, "w", encoding="utf-8") as out:
  write(json.dumps(list(output.values())), out)
vprint("Finished writing.")
print("Finished")
