import { Eval, initFunction, initDataset } from "braintrust";
import { PROJECT_NAME, PROMPT_SLUG } from "@/lib/constants";


Eval(
  "Spotify",
  {
    data: initDataset('Spotify',
                      {dataset: "SongRetrievalDataset"}) ,
    task: initFunction({projectName: PROJECT_NAME,
                        slug: PROMPT_SLUG}),
    scores: [
        initFunction({
          projectName: PROJECT_NAME,
          slug: "duplicate-song-e757"
        }),
        initFunction({
          projectName: PROJECT_NAME,
          slug: "over-three-per-artist-604c"
        })
      ],
  },
);