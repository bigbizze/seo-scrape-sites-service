import { sslParser } from "./ssl-parser";
import { ScrapeSiteJobEnqueue, ScrapeSiteResult } from "../types";
import { googleAnalyticsParser } from "./google-analytics-parser";
import { wordpressParser } from "./wordpress-parser";

export type ParseFnReturn = Partial<ScrapeSiteResult> | undefined | void;
export type ParserFn = (params: ScrapeSiteJobEnqueue, result: ScrapeSiteResult) => Promise<ParseFnReturn>;

const parsers: ParserFn[] = [
  sslParser,
  googleAnalyticsParser,
  wordpressParser
];

export const getDefaultScrapeSiteResult = (params: ScrapeSiteJobEnqueue): ScrapeSiteResult => ({
  sessionId: params.sessionId,
  id: params.id,
  website: params.website,
  isWordpress: false,
  needs: []
});

const executeParser = async (
  parserPromise: Promise<ParseFnReturn>
): Promise<ParseFnReturn> => {
  try {
    return await parserPromise;
  } catch (e) {
    // console.error(e);
  }
};

export const applyParsers = async (
  params: ScrapeSiteJobEnqueue
) => {
  let scrapeSiteResult = getDefaultScrapeSiteResult(params);
  const parserPromises: Promise<ParseFnReturn>[] = [];
  for (const parser of parsers) {
    parserPromises.push(executeParser(parser(params, scrapeSiteResult)));
  }
  const parserResults = await Promise.all(parserPromises);
  for (const parserResult of parserResults) {
    if (parserResult) {
      scrapeSiteResult = {
        ...scrapeSiteResult,
        ...parserResult
      };
    }
  }
  return scrapeSiteResult;
}





