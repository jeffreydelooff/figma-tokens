import {init} from '@rematch/core';
import {models, RootModel} from './index';

const shadowArray = [
    {
        type: 'innerShadow',
        color: '#00000080',
        x: '0',
        y: '0',
        blur: '2',
        spread: '4',
    },
    {
        type: 'dropShadow',
        color: '#000000',
        x: '0',
        y: '4',
        blur: '4',
        spread: '4',
    },
];

describe('editToken', () => {
    let store;
    beforeEach(() => {
        store = init<RootModel>({
            redux: {
                initialState: {
                    tokenState: {
                        tokens: {
                            global: [
                                {
                                    name: 'primary',
                                    value: '1',
                                },
                                {
                                    name: 'alias',
                                    value: '$primary',
                                },
                                {
                                    name: 'primary50',
                                    value: '0.50',
                                },
                                {
                                    name: 'alias50',
                                    value: '$primary50',
                                },
                                {
                                    name: 'header 1',
                                    type: 'typography',
                                    value: {
                                        fontWeight: '400',
                                        fontSize: '16',
                                    },
                                },
                                {
                                    name: 'header 1',
                                    type: 'typography',
                                    value: {
                                        fontWeight: '400',
                                        fontSize: '16',
                                    },
                                },
                                {
                                    name: 'shadow.mixed',
                                    type: 'boxShadow',
                                    description: 'the one with mixed shadows',
                                    value: shadowArray,
                                },
                            ],
                            options: [
                                {
                                    name: 'background',
                                    value: '$primary',
                                },
                            ],
                        },
                        usedTokenSet: ['global'],
                        importedTokens: {
                            newTokens: [],
                            updatedTokens: [],
                        },
                        activeTokenSet: 'global',
                    },
                },
            },
            models,
        });
    });

    it('calls updateAliases if old name differs from new name', async () => {
        await store.dispatch.tokenState.editToken({
            parent: 'global',
            oldName: 'primary',
            name: 'brand.primary',
            value: '1',
        });

        const {tokens} = store.getState().tokenState;
        expect(tokens.global[1].value).toEqual('{brand.primary}');
    });

    it('doesnt interfere with tokens that have a similar name', async () => {
        await store.dispatch.tokenState.editToken({
            parent: 'global',
            oldName: 'primary',
            name: 'secondary',
            value: '1',
        });

        const {tokens} = store.getState().tokenState;
        expect(tokens.global[1].value).toEqual('{secondary}');
        expect(tokens.global[3].value).toEqual('$primary50');
        expect(tokens.global[3].value).toEqual('$primary50');
    });

    it('doesnt interfere with other tokens', async () => {
        await store.dispatch.tokenState.editToken({
            parent: 'global',
            oldName: 'primary',
            name: 'secondary',
            value: '1',
        });

        const {tokens} = store.getState().tokenState;
        expect(tokens.global[6].value).toEqual(shadowArray);
    });

    it('also updates tokens from other sets', async () => {
        await store.dispatch.tokenState.editToken({
            parent: 'global',
            oldName: 'primary',
            name: 'secondary',
            value: '1',
        });

        const {tokens} = store.getState().tokenState;
        expect(tokens.options[0].value).toEqual('{secondary}');
    });

    it('does a deep equality check on object values', async () => {
        await store.dispatch.tokenState.setTokensFromStyles({
            colors: [
                {
                    name: 'primary',
                    value: '2',
                },
                {
                    name: 'secondary',
                    value: '3',
                },
            ],
            typography: [
                {
                    name: 'header 1',
                    type: 'typography',
                    value: {
                        fontWeight: '400',
                        fontSize: '16',
                    },
                },
                {
                    name: 'header 2',
                    type: 'typography',
                    value: {
                        fontWeight: '400',
                        fontSize: '14',
                    },
                },
            ],
        });

        const {importedTokens} = store.getState().tokenState;
        expect(importedTokens.newTokens).toEqual([
            {
                name: 'secondary',
                value: '3',
            },
            {
                name: 'header 2',
                type: 'typography',
                value: {
                    fontWeight: '400',
                    fontSize: '14',
                },
            },
        ]);
        expect(importedTokens.updatedTokens).toEqual([
            {
                name: 'primary',
                oldValue: '1',
                value: '2',
            },
        ]);
    });
});
