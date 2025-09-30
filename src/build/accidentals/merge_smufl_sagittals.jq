# Merge SMuFL ranges.json and sagittals.json into a listing of SMuFL accidentals with their cents value.
# Optionally include the existing smufl.json as input to avoid resetting all entries to their default.
#
# Usage:
# jq -s -f merge_smufl_sagittals.jq ranges.json sagittals.json > smufl.json
# jq -s -f merge_smufl_sagittals.jq ranges.json sagittals.json smufl.json | sponge smufl.json
#
def merge_accidentals($accidentals; $sagittals; $smufl):
  reduce ($accidentals | to_entries[]) as $pair (
    {};
    .[$pair.value] = (
      if ($smufl? and $smufl[$pair.value] and $smufl[$pair.value] != null)
      then $smufl[$pair.value]
      else
        if (($sagittals[$pair.value]?) and ($sagittals[$pair.value].pitch.cents != null))
        then $sagittals[$pair.value].pitch.cents
        else null
        end
      end
    )
  );

def combine_accidentals_from_ranges:
  [ .[0] as $obj
    | $obj
    | keys[]
    | select(test("accidental"; "i"))
    | ($obj[.]?["glyphs"]? // [])
  ]
  | add;

merge_accidentals(combine_accidentals_from_ranges; .[1]; .[2])
