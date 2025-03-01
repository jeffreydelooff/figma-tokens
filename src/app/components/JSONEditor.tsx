import * as React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import parseTokenValues from '@/utils/parseTokenValues';
import {track} from '@/utils/analytics';
import parseJson from '@/utils/parseJson';
import Textarea from './Textarea';
import Button from './Button';
import TokenSetSelector from './TokenSetSelector';
import ExportModal from './modals/ExportModal';
import PresetModal from './modals/PresetModal';
import {Dispatch, RootState} from '../store';
import useTokens from '../store/useTokens';
import useConfirm from '../hooks/useConfirm';

const JSONEditor = () => {
    const {tokens, activeTokenSet, editProhibited} = useSelector((state: RootState) => state.tokenState);
    const {tokenType} = useSelector((state: RootState) => state.settings);
    const dispatch = useDispatch<Dispatch>();
    const {getStringTokens} = useTokens();
    const {confirm} = useConfirm();

    const [exportModalVisible, showExportModal] = React.useState(false);
    const [presetModalVisible, showPresetModal] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [stringTokens, setStringTokens] = React.useState(JSON.stringify(tokens[activeTokenSet], null, 2));

    React.useEffect(() => {
        setError(null);
        setStringTokens(tokenType === 'array' ? JSON.stringify(tokens[activeTokenSet], null, 2) : getStringTokens());
    }, [tokens, activeTokenSet, tokenType]);

    const handleUpdate = async () => {
        dispatch.tokenState.setJSONData(stringTokens);
    };

    const handleClearTokens = async () => {
        track('Clear Tokens');

        const userConfirmation = await confirm({
            text: 'Delete all tokens',
            description: 'Are you sure you want to delete all tokens?',
        });
        if (userConfirmation) {
            dispatch.tokenState.setEmptyTokens();
        }
    };

    const changeTokens = (val) => {
        setError(null);
        try {
            const parsedTokens = parseJson(val);
            parseTokenValues(parsedTokens);
        } catch (e) {
            setError(`Unable to read JSON: ${JSON.stringify(e)}`);
        }
        setStringTokens(val);
    };

    return (
        <div className="flex flex-col grow">
            {exportModalVisible && <ExportModal onClose={() => showExportModal(false)} />}
            {presetModalVisible && <PresetModal onClose={() => showPresetModal(false)} />}
            <TokenSetSelector />
            <div className="flex flex-col justify-between items-center grow">
                <div className="flex flex-col p-4 pt-2 w-full items-center grow">
                    <Textarea
                        isDisabled={editProhibited}
                        className="grow"
                        placeholder="Enter JSON"
                        rows={21}
                        onChange={changeTokens}
                        value={stringTokens}
                    />
                    {error && (
                        <div className="w-full font-bold p-2 text-xs rounded mt-2 bg-red-100 text-red-700">{error}</div>
                    )}
                </div>
            </div>

            <div className="flex justify-between w-full px-4 bg-white">
                <div className="space-x-2 flex mr-2">
                    <Button
                        id="load-preset"
                        disabled={editProhibited}
                        variant="secondary"
                        onClick={() => showPresetModal(true)}
                    >
                        Load preset
                    </Button>
                    <Button id="clear-tokens" disabled={editProhibited} variant="secondary" onClick={handleClearTokens}>
                        Clear
                    </Button>
                </div>
                <div className="space-x-2 flex">
                    <Button id="export" variant="secondary" onClick={() => showExportModal(true)}>
                        Export
                    </Button>
                    <Button
                        id="save-update-json"
                        disabled={editProhibited || error}
                        variant="primary"
                        onClick={handleUpdate}
                    >
                        Save & update
                    </Button>
                </div>
            </div>
        </div>
    );
};
export default JSONEditor;
