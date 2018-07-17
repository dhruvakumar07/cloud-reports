import { Dictionary } from './types';
import { CollectorUtil, CommonUtil } from './utils';
import * as Collectors from './collectors';
import * as flat from 'flat';

function getModules(moduleNames?: string | Array<string>) {
    if (!moduleNames) {
        return [];
    }
    if (Array.isArray(moduleNames)) {
        return moduleNames;
    }
    else if (typeof moduleNames === 'string') {
        return moduleNames.split(',');
    }
    return [];
}

export async function collect(moduleNames?: string | Array<string>) {
    const promises: Promise<any>[] = [];
    const flatListOfCollectors = flat(Collectors);

    const modules = getModules(moduleNames);
    const filteredCollectorNames = Object.keys(flatListOfCollectors).filter((collectorName) => {
        if (!collectorName.endsWith('Collector')) {
            return false;
        }
        if (modules.length) {
            return modules.some((moduleName) => {
                return collectorName.split(".").indexOf(moduleName) !== -1;
            });
        }
        return true;
    });
    for (let collectorName of filteredCollectorNames) {
        console.info("Running", collectorName);
        const collectorPromise = CollectorUtil.cachedCollect(new flatListOfCollectors[collectorName]())
            .then((data) => {
                const collectNameSpace = collectorName.replace(/.[A-Za-z0-9]+$/, '');
                return {
                    data,
                    namespace: collectNameSpace
                }
            }).catch((err) => {
                console.error(collectorName, "failed", err);
            });
        await CommonUtil.wait(500);
        promises.push(collectorPromise);
    }
    try {
        const collectorResults = await Promise.all(promises);
        return collectorResults.reduce((result, collectResult) => {
            if (collectResult) {
                result[collectResult.namespace] = result[collectResult.namespace] || {};
                result[collectResult.namespace] = Object.assign(result[collectResult.namespace], collectResult.data);
            }
            return result;
        }, {});
    } catch (err) {
        throw err;
    }
}








