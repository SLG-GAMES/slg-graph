import {
    Transfer,
    AttributeAttached,
    AttributeAttachedBatch,
    AttributeUpdated,
    AttributeUpdatedBatch,
    AttributeRemoved,
    AttributeRemoveBatch,
    GameLootEquipment, Revealed,
} from "../generated/GameLootEquipment/GameLootEquipment"
import { LootAssetsEntity } from "../generated/schema"
import { Address, BigInt, log, store } from '@graphprotocol/graph-ts'

// =============== reveal ===============

export function handleRevealed(event: Revealed): void {
    let assetID = event.address.toHex() + "_" + event.params.tokenID.toString();

    let lootAssets = LootAssetsEntity.load(assetID);
    if (lootAssets == null) {
        lootAssets = new LootAssetsEntity(assetID);
        lootAssets.contract = event.address;
        lootAssets.tokenId = event.params.tokenID;
    }
    lootAssets.revealed = true;
    lootAssets.save()
}

// =============== attributes handlers ===============

export function handleAttributeAttached(event: AttributeAttached): void {
    let assetID = event.address.toHex() + "_" + event.params.tokenID.toString();
    let lootAssets = LootAssetsEntity.load(assetID);
    if (lootAssets == null) {
        lootAssets = new LootAssetsEntity(assetID);
        lootAssets.contract = event.address;
        lootAssets.tokenId = event.params.tokenID;
    }

    let contract = GameLootEquipment.bind(event.address);
    let uri = getTokenURI(contract, event.params.tokenID);
    lootAssets.tokenURI = uri;

    lootAssets.save();
}
export function handleAttributeAttachedBatch(event: AttributeAttachedBatch): void {
    let assetID = event.address.toHex() + "_" + event.params.tokenID.toString();

    let lootAssets = LootAssetsEntity.load(assetID);
    if (lootAssets == null) {
        lootAssets = new LootAssetsEntity(assetID);
        lootAssets.contract = event.address;
        lootAssets.tokenId = event.params.tokenID;
    }

    let contract = GameLootEquipment.bind(event.address);
    let uri = getTokenURI(contract, event.params.tokenID);
    lootAssets.tokenURI = uri;

    lootAssets.save();
}
export function handleAttributeUpdated(event: AttributeUpdated): void {
    let assetID = event.address.toHex() + "_" + event.params.tokenID.toString();

    let lootAssets = LootAssetsEntity.load(assetID);
    if (lootAssets == null) {
        lootAssets = new LootAssetsEntity(assetID);
        lootAssets.contract = event.address;
        lootAssets.tokenId = event.params.tokenID;
    }

    let contract = GameLootEquipment.bind(event.address);
    let uri = getTokenURI(contract, event.params.tokenID);
    lootAssets.tokenURI = uri;

    lootAssets.save();
}
export function handleAttributeUpdatedBatch(event: AttributeUpdatedBatch): void {
    let assetID = event.address.toHex() + "_" + event.params.tokenID.toString();

    let lootAssets = LootAssetsEntity.load(assetID);
    if (lootAssets == null) {
        lootAssets = new LootAssetsEntity(assetID);
        lootAssets.contract = event.address;
        lootAssets.tokenId = event.params.tokenID;
    }

    let contract = GameLootEquipment.bind(event.address);
    let uri = getTokenURI(contract, event.params.tokenID);
    lootAssets.tokenURI = uri;

    lootAssets.save();
}
export function handleAttributeRemoved(event: AttributeRemoved): void {
    let assetID = event.address.toHex() + "_" + event.params.tokenID.toString();

    let lootAssets = LootAssetsEntity.load(assetID);
    if (lootAssets == null) {
        lootAssets = new LootAssetsEntity(assetID);
        lootAssets.contract = event.address;
        lootAssets.tokenId = event.params.tokenID;
    }

    let contract = GameLootEquipment.bind(event.address);
    let uri = getTokenURI(contract, event.params.tokenID);
    lootAssets.tokenURI = uri;

    lootAssets.save();
}
export function handleAttributeRemoveBatch(event: AttributeRemoveBatch): void {
    let assetID = event.address.toHex() + "_" + event.params.tokenID.toString();

    let lootAssets = LootAssetsEntity.load(assetID);
    if (lootAssets == null) {
        lootAssets = new LootAssetsEntity(assetID);
        lootAssets.contract = event.address;
        lootAssets.tokenId = event.params.tokenID;
    }

    let contract = GameLootEquipment.bind(event.address);
    let uri = getTokenURI(contract, event.params.tokenID);
    lootAssets.tokenURI = uri;

    lootAssets.save();
}

// Transfer

export function handleTransfer(event: Transfer): void {
    let contractObject = GameLootEquipment.bind(event.address);

    // asset's id format: address + tokenID Note:require tokenID is smaller then 2^32
    let assetID = event.address.toHex() + "_" + event.params.tokenId.toString();

    let lootAsset = new LootAssetsEntity(assetID);
    lootAsset.tokenId = event.params.tokenId;
    lootAsset.contract = event.address;

    // set uri when mint
    if (Address.zero().equals(event.params.from)) {
        let uri = getTokenURI(contractObject, event.params.tokenId)
        lootAsset.tokenURI = uri
        lootAsset.revealed = false;
    }

    lootAsset.owner = event.params.to;
    lootAsset.save();
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

function getTokenURI(contract: GameLootEquipment, tokenID: BigInt): string {
    let callResult = contract.try_tokenURI(tokenID)
    if (callResult.reverted) {
        log.error("get tokenid {} failed", [tokenID.toString()])
        return "";
    } else {
        return normalize(callResult.value);
    }
}