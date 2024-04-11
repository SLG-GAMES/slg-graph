import {
    Transfer as TransferEq,
    AttributeAttached,
    AttributeAttachedBatch,
    AttributeUpdated,
    AttributeUpdatedBatch,
    AttributeRemoved,
    AttributeRemoveBatch,
    GameLootEquipment, Revealed,
} from "../generated/GameLootEquipment/GameLootEquipment"

// for props
import { Prop } from "../generated/templates";
import { Generate } from "../generated/PropFactory/GameERC721Factory";
import { Transfer as TransferProp, GameERC721Token } from "../generated/templates/Prop/GameERC721Token";

import { LootAssetsEntity } from "../generated/schema"
import { BigInt, log, store } from '@graphprotocol/graph-ts'

let ZERO_ADDRESS_STRING = '0x0000000000000000000000000000000000000000';


// factory generate new prop
export function handlePropGenerate(event: Generate): void {
    log.info('handlePropGenerate has been triggerred: {} {}', [event.params.nft.toHex(), event.params.index.toString()]);
    Prop.create(event.params.nft);
}

export function handleTransferProps(event: TransferProp): void {
    log.info('handleTransferProps has been triggerred: {}', [event.address.toHex()]);

    let contractAddress = event.address;

    let contractObject = GameERC721Token.bind(contractAddress);

    let assetID = event.address.toHex() + "_" + event.params.tokenId.toString();

    let lootAsset = LootAssetsEntity.load(assetID);
    if (lootAsset == null) {
        lootAsset = new LootAssetsEntity(assetID);
        lootAsset.tokenId = event.params.tokenId;
        lootAsset.contract = event.address;
    }

    let from = event.params.from.toHex();
    let to = event.params.to.toHex();
    let tokenId = event.params.tokenId;

    // set uri 
    if (lootAsset.tokenURI == "") {
        let uri = getTokenURICommon(contractObject, tokenId)
        lootAsset.tokenURI = uri
    }

    lootAsset.owner = event.params.to;
    lootAsset.save();
}




// =============== get tokenURI ===============

function getTokenURICommon(contract: GameERC721Token, tokenID: BigInt): string {
    let callResult = contract.try_tokenURI(tokenID)
    if (callResult.reverted) {
        log.error("get tokenid {} failed", [tokenID.toString()])
        return "";
    } else {
        return normalize(callResult.value);
    }
}

function setCharAt(str: string, index: i32, char: string): string {
    if (index > str.length - 1) return str;
    return str.substr(0, index) + char + str.substr(index + 1);
}

function normalize(strValue: string): string {
    if (strValue.length === 1 && strValue.charCodeAt(0) === 0) {
        return "";
    } else {
        for (let i = 0; i < strValue.length; i++) {
            if (strValue.charCodeAt(i) === 0) {
                strValue = setCharAt(strValue, i, '\ufffd'); // graph-node db does not support string with '\u0000'
            }
        }
        return strValue;
    }
}