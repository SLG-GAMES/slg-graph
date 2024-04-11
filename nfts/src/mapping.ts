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
import { GameERC721Token } from "../generated/BOSSChest/GameERC721Token";
import {LootAssetsEntity, Attribute, TokenContract} from "../generated/schema"
import {BigInt, log, store} from '@graphprotocol/graph-ts'


let ZERO_ADDRESS_STRING = '0x0000000000000000000000000000000000000000';


function setCharAt(str: string, index: i32, char: string): string {
  if(index > str.length-1) return str;
  return str.substr(0,index) + char + str.substr(index+1);
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

function getTokenURI(contract: GameLootEquipment,tokenID: BigInt ) : string {
  let callResult = contract.try_tokenURI(tokenID)
  if (callResult.reverted) {
    log.error("get tokenid {} failed",[tokenID.toString()])
    return "";
  } else {
    return normalize(callResult.value);
  }
}

function getTokenURICommon(contract: GameERC721Token,tokenID: BigInt ) : string {
  let callResult = contract.try_tokenURI(tokenID)
  if (callResult.reverted) {
    log.error("get tokenid {} failed",[tokenID.toString()])
    return "";
  } else {
    return normalize(callResult.value);
  }
}

export function handleRevealed(event: Revealed):void {
  //let contract = GameLootEquipment.bind(event.address);
  let id = event.address.toHex() + '_' + event.params.tokenID.toHex();

  let lootAssets = LootAssetsEntity.load(id);
  if (lootAssets != null) {
    lootAssets.revealed = true;
    lootAssets.save()
  }
}

export function handleTransfer(event: Transfer): void {
  let contract = GameLootEquipment.bind(event.address);

  let contractID = event.address.toHex();
  let tokenContract = TokenContract.load(contractID);
  if (tokenContract == null) {
    tokenContract = new TokenContract(contractID);
    tokenContract.name = contract.name();
    tokenContract.symbol = contract.symbol();
    tokenContract.save();
  }

  let id = event.address.toHex() + '_' + event.params.tokenId.toHex();

  let lootAssets = LootAssetsEntity.load(id);
  if (lootAssets == null) {
    lootAssets = new LootAssetsEntity(id);
  }

  let from = event.params.from.toHex();
  let to = event.params.to.toHex();
  let tokenId = event.params.tokenId;
  //set uri when mint
  if (from == ZERO_ADDRESS_STRING  &&  to != ZERO_ADDRESS_STRING)  {
    // TODO:
    let uri = getTokenURI(contract,tokenId)
    lootAssets.tokenURI = uri
    lootAssets.revealed = false;
  }

  lootAssets.contract = event.address;
  lootAssets.owner = event.params.to;
  lootAssets.tokenId = event.params.tokenId;
  lootAssets.token = tokenContract.id;
  lootAssets.save();
}

export function handleTransferProps(event: Transfer): void {
  let contract = GameERC721Token.bind(event.address);

  let contractID = event.address.toHex();
  let tokenContract = TokenContract.load(contractID);
  if (tokenContract == null) {
    tokenContract = new TokenContract(contractID);
    tokenContract.name = contract.name();
    tokenContract.symbol = contract.symbol();
    tokenContract.save();
  }

  let id = event.address.toHex() + '_' + event.params.tokenId.toHex();

  let lootAssets = LootAssetsEntity.load(id);
  if (lootAssets == null) {
    lootAssets = new LootAssetsEntity(id);
  }

  let from = event.params.from.toHex();
  let to = event.params.to.toHex();
  let tokenId = event.params.tokenId;
  //set uri when mint
  if (from == ZERO_ADDRESS_STRING  &&  to != ZERO_ADDRESS_STRING)  {
    // TODO:
    let uri = getTokenURICommon(contract,tokenId)
    lootAssets.tokenURI = uri
    lootAssets.revealed = false;
  }

  lootAssets.contract = event.address;
  lootAssets.owner = event.params.to;
  lootAssets.tokenId = event.params.tokenId;
  lootAssets.token = tokenContract.id;
  lootAssets.save();
}

export function handleAttributeAttached(event: AttributeAttached): void {
  let assetId = event.address.toHex() + '_' + event.params.tokenID.toHex();
  let lootAssets = LootAssetsEntity.load(assetId);
  if (lootAssets == null) {
    lootAssets = new LootAssetsEntity(assetId);
  }else {
    let contract = GameLootEquipment.bind(event.address);
    let uri = getTokenURI(contract,event.params.tokenID)
    lootAssets.tokenURI = uri
    lootAssets.save()
  }

  let contract = GameLootEquipment.bind(event.address);
  let uri = getTokenURI(contract,event.params.tokenID)
  lootAssets.tokenURI = uri
  lootAssets.save()

  let id = event.address.toHex() + '_' + event.params.tokenID.toHex() + '_' + event.params.attrID.toHex();
  let attribute = Attribute.load(id);
  if (attribute == null) {
    attribute = new Attribute(id);
  }

  attribute.attrID = event.params.attrID;
  attribute.value = event.params.value;
  attribute.asset = lootAssets.id;
  attribute.save();
}

export function handleAttributeAttachedBatch(event: AttributeAttachedBatch): void {
  let assetId = event.address.toHex() + '_' + event.params.tokenID.toHex();
  let lootAssets = LootAssetsEntity.load(assetId);
  if (lootAssets == null) {
    lootAssets = new LootAssetsEntity(assetId);
  } else {
    let contract = GameLootEquipment.bind(event.address);
    let uri = getTokenURI(contract,event.params.tokenID)
    lootAssets.tokenURI = uri
    lootAssets.save()
  }



  for (let i = 0; i < event.params.attrIDs.length; i++) {
    let id = event.address.toHex() + '_' + event.params.tokenID.toHex() + '_' + event.params.attrIDs[i].toHex();

    let attribute = Attribute.load(id);
    if (attribute == null) {
      attribute = new Attribute(id);
    }

    attribute.attrID = event.params.attrIDs[i];
    attribute.value = event.params.values[i];
    attribute.asset = lootAssets.id;
    attribute.save();
  }
}

export function handleAttributeUpdated(event: AttributeUpdated): void {
  let assetId = event.address.toHex() + '_' + event.params.tokenID.toHex();

  let lootAssets = LootAssetsEntity.load(assetId);
  if (lootAssets == null) {
    log.warning('lootAssets is null assetId: {}', [assetId]);
    return;
  }

  let contract = GameLootEquipment.bind(event.address);
  let uri = getTokenURI(contract,event.params.tokenID)
  lootAssets.tokenURI = uri
  lootAssets.save()


  let attributes = contract.attributes(event.params.tokenID);

  let id = event.address.toHex() + '_' + event.params.tokenID.toHex() + '_' + attributes[event.params.attrIndex.toI32()].attrID.toHex();
  let attribute = Attribute.load(id);
  if (attribute == null) {
    attribute = new Attribute(id);
    attribute.attrID = attributes[event.params.attrIndex.toI32()].attrID;
    attribute.asset = assetId;
  }

  attribute.value = event.params.value;
  attribute.save();
}

export function handleAttributeUpdatedBatch(event: AttributeUpdatedBatch): void {
  let contract = GameLootEquipment.bind(event.address);
  let attributes = contract.attributes(event.params.tokenID);

  let assetId = event.address.toHex() + '_' + event.params.tokenID.toHex();
  let lootAssets = LootAssetsEntity.load(assetId);
  if (lootAssets == null){
    log.warning('lootAssets is null assetId: {}', [assetId]);
    return;
  }

  let uri = getTokenURI(contract,event.params.tokenID)
  lootAssets.tokenURI = uri
  lootAssets.save()


  for (let i = 0; i < event.params.attrIndexes.length; i++) {
    let id = event.address.toHex() + '_' + event.params.tokenID.toHex() + '_' + attributes[event.params.attrIndexes[i].toI32()].attrID.toHex();
    let attribute = Attribute.load(id);
    if (attribute == null) {
      attribute = new Attribute(id);
      attribute.attrID = attributes[event.params.attrIndexes[i].toI32()].attrID;
      attribute.asset = assetId;
    }

    attribute.value = event.params.values[i];
    attribute.save();
  }
}

export function handleAttributeRemoved(event: AttributeRemoved): void {
  let id = event.address.toHex() + '_' + event.params.tokenID.toHex() + '_' + event.params.attrID.toHex();
  log.info("handleAttributeRemoved ::: id:{}",[id])

  store.remove('Attribute', id);

  let assetId = event.address.toHex() + '_' + event.params.tokenID.toHex();

  let lootAssets = LootAssetsEntity.load(assetId);
  if (lootAssets == null) {
    log.warning('lootAssets is null assetId: {}', [assetId]);
    return;
  }

  let contract = GameLootEquipment.bind(event.address);
  let uri = getTokenURI(contract,event.params.tokenID)
  lootAssets.tokenURI = uri
  lootAssets.save()

}

export function handleAttributeRemoveBatch(event: AttributeRemoveBatch): void {
  for (let i = 0; i < event.params.attrIDs.length; i++) {
    let id = event.address.toHex() + '_' + event.params.tokenID.toHex() + '_' + event.params.attrIDs[i].toHex();
    store.remove('Attribute', id);
  }

  let assetId = event.address.toHex() + '_' + event.params.tokenID.toHex();

  let lootAssets = LootAssetsEntity.load(assetId);
  if (lootAssets == null) {
    log.warning('lootAssets is null assetId: {}', [assetId]);
    return;
  }

  let contract = GameLootEquipment.bind(event.address);
  let uri = getTokenURI(contract,event.params.tokenID)
  lootAssets.tokenURI = uri
  lootAssets.save()

}