import { readFile } from 'node:fs/promises';
import type {
  ExcludedKnowledgeItem,
  KnowledgeGateway,
  KnowledgePacket,
  KnowledgePacketItem,
  KnowledgePacketRequest,
} from './contracts/index.ts';

type ExportedPacket = {
  items?: Array<{
    cite_handle?: string;
    record_id?: string;
    citation?: string;
    record?: {
      id?: string;
      kind?: string;
      text?: string;
      source_case?: string;
      trust_tier?: string;
      visibility?: string;
    };
  }>;
  excluded?: Array<{
    record_id?: string;
    case?: string;
    reason?: string;
    kind?: string;
    visibility?: string;
  }>;
};

function adaptItem(item: NonNullable<ExportedPacket['items']>[number]): KnowledgePacketItem {
  const record = item.record || {};
  return {
    recordId: String(item.record_id || record.id || ''),
    citeHandle: String(item.cite_handle || ''),
    kind: String(record.kind || ''),
    text: String(record.text || ''),
    sourceCase: String(record.source_case || ''),
    citation: String(item.citation || ''),
    trustTier: String(record.trust_tier || ''),
    visibility: String(record.visibility || ''),
  };
}

function adaptExcluded(item: NonNullable<ExportedPacket['excluded']>[number]): ExcludedKnowledgeItem {
  return {
    recordId: item.record_id ? String(item.record_id) : undefined,
    case: item.case ? String(item.case) : undefined,
    reason: String(item.reason || 'excluded'),
    kind: item.kind ? String(item.kind) : undefined,
    visibility: item.visibility ? String(item.visibility) : undefined,
  };
}

export async function createJsonKnowledgeGateway(packetFile: string): Promise<KnowledgeGateway> {
  const raw = JSON.parse(await readFile(packetFile, 'utf8')) as Record<string, ExportedPacket>;
  return {
    selectPacket(request: KnowledgePacketRequest): KnowledgePacket {
      const exported = raw[request.targetCase];
      if (!exported) {
        return {
          id: `packet:${request.runId}:${request.targetCase}`,
          request,
          items: [],
          excluded: [
            {
              case: request.targetCase,
              reason: 'no exported knowledge packet for target case',
            },
          ],
        };
      }
      return {
        id: `packet:${request.runId}:${request.targetCase}`,
        request,
        items: (exported.items || []).slice(0, request.maxItems).map(adaptItem),
        excluded: (exported.excluded || []).map(adaptExcluded),
      };
    },
  };
}
