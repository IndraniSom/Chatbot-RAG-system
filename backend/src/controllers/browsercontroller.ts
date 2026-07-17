import { Request, Response } from "express";
import browserService from "../services/crawler/browser.service";

class BrowserController {
  async testBrowser(req: Request, res: Response) {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({
          success: false,
          message: "URL is required",
        });
      }

      const result = await browserService.openWebsite(url);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to open website",
      });
    }
  }
}

export default new BrowserController();