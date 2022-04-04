import { Injectable } from '@nestjs/common';
import { isEmpty } from 'lodash';

import {
  VillageResourcesSummary,
  VillageResourcesSummaryResource,
  VillageResourcesSummaryResourceFighter,
} from 'apps/cme-backend/src/villages/types';
import { Village } from 'apps/cme-backend/src/villages/village.entity';
import { VillageResourceType } from 'apps/cme-backend/src/villages-resource-types/village-resource-type.entity';

@Injectable()
export class ResourcesMsService {
  // TODO: plug this to the /villages/:id/resources controller route when ready.
  formatVillageResources(village: Village): VillageResourcesSummary {
    const fighters: Array<VillageResourcesSummaryResourceFighter> = [];
    const others: Array<VillageResourcesSummaryResource> = [];

    village.villagesResourceTypes?.forEach((res: VillageResourceType) => {
      const baseInfo: VillageResourcesSummaryResource = {
        name: res.resourceType.type,
        industryId: Number(res.resourceType.industry),
        count: res.count,
        id: res.resourceType.id,
      };

      if (!isEmpty(res.resourceType.characteristics)) {
        fighters.push({
          ...baseInfo,
          health: res.resourceType.characteristics['health'],
          range: res.resourceType.characteristics['range'],
          damage: res.resourceType.characteristics['damage'],
          defense: res.resourceType.characteristics['defense'],
          pierce_defense: res.resourceType.characteristics['pierce_defense'],
          speed: res.resourceType.characteristics['speed'],
          food_upkeep: res.resourceType.characteristics['food_upkeep'],
          production_time: res.resourceType.characteristics['production_time'],
        });
      } else {
        others.push(baseInfo);
      }
    });

    return {
      fighters,
      others,
    };
  }
}
