#!/bin/bash

last_tag=$(git describe --tags --abbrev=0)

if [ -z "$last_tag" ]; then
    last_tag="HEAD"
else
    last_tag="$last_tag..HEAD"
fi

commits_list=$(git --no-pager log $last_tag --oneline --pretty=format:"- %s\\n" | uniq | tr -d '\n' | sed 's/\"/\\"/g')

echo '{"tag_name":"'$1'","name":"'$1'","body":"'$commits_list'"}' > /tmp/release.json