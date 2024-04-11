import { BigInt } from "@graphprotocol/graph-ts";
import {
    Claimed,
    Closed,
    Created,
    NewPrice,
    NewTime,
    Swapped
} from "../generated/GameDaoFixedNFT/GameDaoFixedNFT";
import { Pool, Activity } from "../generated/schema";
import { Bytes, TypedMap } from "@graphprotocol/graph-ts";

let ZERO_ADDRESS_STRING = "0x0000000000000000000000000000000000000000";
let ZERO_ADDRESS: Bytes = Bytes.fromHexString(ZERO_ADDRESS_STRING) as Bytes;
let ZERO_BigInt = BigInt.fromI32(0);
let ZERO_Bytes: Bytes = Bytes.fromHexString("0x0000000000000000000000000000000000000000") as Bytes;

//list cancel purchase swap
let ACTIVITY_LIST = "list";
let ACTIVITY_CANCEL = "cancel";
let ACTIVITY_PURCHASE = "purchase";
let ACTIVITY_SALE = "sale";
let ACTIVITY_REDEEM = "redeem";
let ActivityMap = new TypedMap<string, BigInt>();
ActivityMap.set(ACTIVITY_LIST, BigInt.fromI32(1));
ActivityMap.set(ACTIVITY_CANCEL, BigInt.fromI32(2));
ActivityMap.set(ACTIVITY_PURCHASE, BigInt.fromI32(3));
ActivityMap.set(ACTIVITY_SALE, BigInt.fromI32(4));
ActivityMap.set(ACTIVITY_REDEEM, BigInt.fromI32(5));

export function handleClaimed(event: Claimed): void {
    let id = event.params.index.toHex();
    let pool = Pool.load(id);
    if (pool != null) {
        pool.redeemed = true;
        pool.redeemTime = event.block.timestamp;
        pool.redeemHash = event.transaction.hash;
        pool.save();

        let activityID =
            event.transaction.hash.toHex() +
            "_" +
            event.transactionLogIndex.toString() +
            "_" +
            pool.creator.toHex();
        let activity = new Activity(activityID);
        let v = ActivityMap.get(ACTIVITY_REDEEM);
        let activityType = BigInt.fromI32(0);
        activityType = v!;
        activity.activityType = activityType;
        activity.token0 = pool.token0;
        activity.token1 = pool.token1;
        activity.amountTotal1 = pool.amountTotal1;
        activity.tokenId = pool.tokenId;
        activity.activityer = pool.creator;
        activity.creator = pool.creator;
        activity.buyer = pool.buyer;
        activity.time = event.block.timestamp;
        activity.hash = event.transaction.hash;
        activity.save();
    }
}

export function handleClosed(event: Closed): void {
    let id = event.params.index.toHex();
    let pool = Pool.load(id);
    if (pool != null) {
        pool.closed = true;
        pool.closedTime = event.block.timestamp;
        pool.closedHash = event.transaction.hash;
        pool.closeAt = event.block.timestamp.minus(BigInt.fromI32(1));
        pool.save();

        let activityID =
            event.transaction.hash.toHex() +
            "_" +
            event.transactionLogIndex.toString() +
            "_" +
            pool.creator.toHex();
        let activity = new Activity(activityID);
        let v = ActivityMap.get(ACTIVITY_CANCEL);
        let activityType = BigInt.fromI32(0);
        activityType = v!;
        activity.activityType = activityType;
        activity.token0 = pool.token0;
        activity.token1 = pool.token1;
        activity.amountTotal1 = pool.amountTotal1;
        activity.tokenId = pool.tokenId;
        activity.activityer = pool.creator;
        activity.creator = pool.creator;
        activity.buyer = pool.buyer;
        activity.time = event.block.timestamp;
        activity.hash = event.transaction.hash;
        activity.save();
    }
}

export function handleCreated(event: Created): void {
    let id = event.params.index.toHex();
    let pool = new Pool(id);
    pool.index = event.params.index;
    pool.creator = event.params.pool.creator;
    pool.token0 = event.params.pool.token0;
    pool.token1 = event.params.pool.token1;
    pool.tokenId = event.params.pool.tokenId;
    pool.amountTotal0 = event.params.pool.amountTotal0;
    pool.amountTotal1 = event.params.pool.amountTotal1;
    pool.closeAt = event.params.pool.closeAt;
    pool.swapped = false;
    pool.closed = false;
    pool.buyer = ZERO_ADDRESS;
    pool.createdTime = event.block.timestamp;
    pool.createdHash = event.transaction.hash;
    pool.swappedTime = ZERO_BigInt;
    pool.swappedHash = ZERO_Bytes;
    pool.closedTime = ZERO_BigInt;
    pool.closedHash = ZERO_Bytes;
    pool.redeemed = false;
    pool.redeemTime = ZERO_BigInt;
    pool.redeemHash = ZERO_Bytes;
    pool.save();

    let activityID =
        event.transaction.hash.toHex() +
        "_" +
        event.transactionLogIndex.toString() +
        "_" +
        pool.creator.toHex();

    let v = ActivityMap.get(ACTIVITY_LIST);
    let activityType = BigInt.fromI32(0);

    activityType = v!;

    let activity = new Activity(activityID);
    activity.activityType = activityType;
    activity.token0 = pool.token0;
    activity.token1 = pool.token1;
    activity.amountTotal1 = pool.amountTotal1;
    activity.tokenId = pool.tokenId;
    activity.activityer = pool.creator;
    activity.creator = pool.creator;
    activity.buyer = pool.buyer;
    activity.time = event.block.timestamp;
    activity.hash = event.transaction.hash;
    activity.save();
}

export function handleNewPrice(event: NewPrice): void {
    let id = event.params.index.toHex();
    let pool = Pool.load(id);
    if (pool != null) {
        pool.amountTotal1 = event.params.price;
        pool.save();

        let activityID =
            event.transaction.hash.toHex() +
            "_" +
            event.transactionLogIndex.toString() +
            "_" +
            pool.creator.toHex();
        let v = ActivityMap.get(ACTIVITY_LIST);
        let activityType = BigInt.fromI32(0);

        activityType = v!;

        let activity = new Activity(activityID);
        activity.activityType = activityType;
        activity.token0 = pool.token0;
        activity.token1 = pool.token1;
        activity.amountTotal1 = event.params.price;
        activity.tokenId = pool.tokenId;
        activity.activityer = pool.creator;
        activity.creator = pool.creator;
        activity.buyer = pool.buyer;
        activity.time = event.block.timestamp;
        activity.hash = event.transaction.hash;
        activity.save();
    }
}

export function handleNewTime(event: NewTime): void {
    let id = event.params.index.toHex();
    let pool = Pool.load(id);
    if (pool != null) {
        pool.closeAt = event.params.timestamp;
        pool.save();
    }
}

export function handleSwapped(event: Swapped): void {
    let id = event.params.index.toHex();
    let pool = Pool.load(id);
    if (pool != null) {
        pool.swapped = true;
        pool.swappedTime = event.block.timestamp;
        pool.swappedHash = event.transaction.hash;
        pool.buyer = event.params.sender;
        pool.save();

        if (pool.creator === pool.buyer) {
            let activityID =
                event.transaction.hash.toHex() +
                "_" +
                event.transactionLogIndex.toString() +
                "_" +
                pool.creator.toHex();
            let v = ActivityMap.get(ACTIVITY_PURCHASE);
            let activityType = BigInt.fromI32(0);

            activityType = v!;

            let activity = new Activity(activityID);
            activity.activityType = activityType;
            activity.token0 = pool.token0;
            activity.token1 = pool.token1;
            activity.amountTotal1 = pool.amountTotal1;
            activity.tokenId = pool.tokenId;
            activity.activityer = pool.creator;
            activity.creator = pool.creator;
            activity.buyer = event.params.sender;
            activity.time = event.block.timestamp;
            activity.hash = event.transaction.hash;
            activity.save();
        } else {
            let creatorActivityID =
                event.transaction.hash.toHex() +
                "_" +
                event.transactionLogIndex.toString() +
                "_" +
                pool.creator.toHex();
            let creatorV = ActivityMap.get(ACTIVITY_SALE);
            let creatorActivityType = BigInt.fromI32(0);

            creatorActivityType = creatorV!;

            let creatorActivity = new Activity(creatorActivityID);
            creatorActivity.activityType = creatorActivityType;
            creatorActivity.amountTotal1 = pool.amountTotal1;
            creatorActivity.token0 = pool.token0;
            creatorActivity.token1 = pool.token1;
            creatorActivity.tokenId = pool.tokenId;
            creatorActivity.activityer = pool.creator;
            creatorActivity.creator = pool.creator;
            creatorActivity.buyer = event.params.sender;
            creatorActivity.time = event.block.timestamp;
            creatorActivity.hash = event.transaction.hash;
            creatorActivity.save();

            let buyerActivityID =
                event.transaction.hash.toHex() +
                "_" +
                event.transactionLogIndex.toString() +
                "_" +
                event.params.sender.toHex();
            let buyerV = ActivityMap.get(ACTIVITY_PURCHASE);
            let buyerActivityType = BigInt.fromI32(0);

            buyerActivityType = buyerV!;

            let buyerActivity = new Activity(buyerActivityID);
            buyerActivity.activityType = buyerActivityType;
            buyerActivity.amountTotal1 = pool.amountTotal1;
            buyerActivity.token0 = pool.token0;
            buyerActivity.token1 = pool.token1;
            buyerActivity.tokenId = pool.tokenId;
            buyerActivity.activityer = event.params.sender;
            buyerActivity.creator = pool.creator;
            buyerActivity.buyer = event.params.sender;
            buyerActivity.time = event.block.timestamp;
            buyerActivity.hash = event.transaction.hash;
            buyerActivity.save();
        }
    }
}
