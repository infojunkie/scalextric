# Merge SMuFL classes.json and sagittals.json into a listing of SMuFL accidentals with their cents value.
# Optionally include the existing smufl.json as input to avoid resetting all entries to their default.
#
# Usage:
# jq -s -f merge_smufl_sagittals.jq classes.json sagittals.json > smufl.json
# jq -s -f merge_smufl_sagittals.jq classes.json sagittals.json smufl.json | sponge smufl.json
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

def combine_accidentals:
  .[0]
  | to_entries
  | map(select(.key | startswith("accidentals")))
  | map(.value[])
  | map({key:.,value:1})
  | from_entries
  | keys_unsorted
;

merge_accidentals(combine_accidentals; .[1]; .[2])
