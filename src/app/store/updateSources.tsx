import {MessageToPluginTypes} from '@types/messages';
import {mergeTokenGroups, resolveTokenValues} from '@/plugin/tokenHelpers';
import {TokenProps} from 'Types/tokens';
import {ContextObject, StorageProviderType} from 'Types/api';
import {notifyToUI, postToFigma} from '../../plugin/notifiers';
import {updateJSONBinTokens} from './providers/jsonbin';
import {track} from '@/utils/analytics';

async function updateRemoteTokens({
    provider,
    tokens,
    context,
    updatedAt,
    oldUpdatedAt,
}: {
    provider: StorageProviderType;
    tokens: TokenProps;
    context: ContextObject;
    updatedAt: string;
    oldUpdatedAt?: string;
}) {
    if (!context) return;
    switch (provider) {
        case StorageProviderType.JSONBIN: {
            track('pushTokens', {provider: StorageProviderType.JSONBIN});

            notifyToUI('Updating JSONBin...');
            updateJSONBinTokens({
                tokens,
                context,
                updatedAt,
                oldUpdatedAt,
            });
            break;
        }

        case StorageProviderType.GITHUB: {
            break;
        }
        default:
            throw new Error('Not implemented');
    }
}

export default async function updateTokensOnSources({
    tokens,
    tokenValues,
    usedTokenSet,
    settings,
    updatedAt,
    shouldUpdateRemote = true,
    isLocal,
    editProhibited,
    storageType,
    api,
    lastUpdatedAt,
}) {
    if (tokens && !isLocal && shouldUpdateRemote && !editProhibited) {
        updateRemoteTokens({
            provider: storageType.provider,
            tokens,
            context: api,
            updatedAt,
            oldUpdatedAt: lastUpdatedAt,
        });
    }
    const mergedTokens = tokens ? resolveTokenValues(mergeTokenGroups(tokens, usedTokenSet)) : null;

    postToFigma({
        type: MessageToPluginTypes.UPDATE,
        tokenValues,
        tokens: tokens ? mergedTokens : null,
        updatedAt,
        settings,
    });
}
