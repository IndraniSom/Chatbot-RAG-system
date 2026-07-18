import { Request, Response } from "express";

import crawlerService from "../services/crawler/crawler.service";
import cleanerService from "../services/content/cleaner.service";
import deduplicateService from "../services/content/deduplicate.service";
import chunkerService from "../services/chunking/chunker.service";
import embeddingService from "../services/embedding/embedding.service";
import qdrantService from "../services/vector/qdrant.service";
import websiteIndexingService from "../services/indexing/website-indexing.service";
class IndexingController {
  async indexWebsite(
req: Request,
res: Response
){

try{

const {
websiteId,
maxPages=20
}=req.body;

const result =
await websiteIndexingService.indexWebsite(
websiteId,
{
maxPages
}
);

return res.status(200).json({

success:true,

message:"Website indexed successfully",

data:result

});

}

catch(error){

return res.status(500).json({

success:false,

message:error instanceof Error
? error.message
:"Unknown Error"

});

}

}
}

export default new IndexingController();