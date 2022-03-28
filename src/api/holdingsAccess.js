import firebaseApp from './firebaseAccessor.js'
import {getFirestore} from 'firebase/firestore'
import { getDoc, doc } from 'firebase/firestore';
const db = getFirestore(firebaseApp);

//INDEX ACCESS TO MAP
export const NAME_POS = 0;
export const TYPE_POS = 1;
export const BROKERS_POS = 2;
export const STOCK_QTY = 'qty';
export const STOCK_PRICE = 'price';
export const TYPE_MAP = {'Tech':0,'REIT':1,'Finance':2,'Energy':3,'Healthcare':4,'Industrials':5}
export const LABEL_TYPES = ['Tech','REIT','Finance','Energy','Healthcare','Industrials']

/*Returns MAP {ticker: [stockName,type,mapBroker], . . . }
  where mapBroker = {brokerName : {price : x, qty : y}, . . .}
*/
export const getAllHoldings = async (userID) => { 
    try {
        var docRef = doc(db, userID,"holdings") //userID as placeholder for curr.uid
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            const dict =  docSnap.data()
            const keys= Object.keys(dict)
            const mapper = new Map();
            for (const ticker of keys) {
                let stockName = dict[ticker]['name']
                let mapBroker = dict[ticker]['broker']
                let type = dict[ticker]['type']
                let arr = [stockName,type,mapBroker]
                mapper.set(ticker,arr)
            }
            //console.log(mapper)
            return mapper 
        } else {
            console.log("Fail to load firebase");
            return null
        }
    } catch (error) {
        console.error(error);
    }
}
/*Returns MAP {ticker: qty , . . . }
*/
export const getHoldingsQty = async (userID) => { 
    try {
        const docRef = doc(db, userID,"holdings") //userID as placeholder for curr.uid
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            const dict =  docSnap.data()
            const keys= Object.keys(dict)

            const mapper = new Map();
            for (const ticker of keys) {
                let qty = 0
                let mapBroker = dict[ticker]['broker']
                for (const maps of Object.values(mapBroker)) {
                    qty += maps[STOCK_QTY] 
                }
                mapper.set(ticker,qty)
            }
            //console.log(mapper)
            return mapper 
        } else {
            console.log("Fail to load firebase");
        }
    } catch (error) {
        console.error(error);
    }
}

//Return Map {type : {ticker: qty}, ....}
export const getDiversity = async (userID) => { 
    try {
        const docRef = doc(db, userID,"holdings") //userID as placeholder for curr.uid
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            let dict =  docSnap.data()
            let newDict = new Map()
            var keys= Object.keys(dict)
            for (const ticker of keys) {
                let qty = 0
                let type = dict[ticker]['type']
                let mapBroker = dict[ticker]['broker']
                for (const maps of Object.values(mapBroker)) {
                    qty += maps[STOCK_QTY]
                }
                if (newDict.has(type)) {
                    let getNestedMap = newDict.get(type)
                    getNestedMap.set(ticker,qty)
                    newDict.set(type,getNestedMap)
                } else {
                    let getNestedMap = new Map()
                    getNestedMap.set(ticker,qty)
                    newDict.set(type,getNestedMap)
                }
            }
            //console.log(mapper)
            return newDict
        } else {
            console.log("Fail to load firebase");
        }
    } catch (error) {
        console.error(error);
    }
}

//Obtain Agg price
export const updateAggPrice = async (userID,ticker) => { 
    try {
        const docRef = doc(db, userID,"holdings") //userID as placeholder for curr.uid
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            let dict =  docSnap.data()
            let qty = 0
            let sum = 0
            let mapBroker = dict[ticker]['broker']
            for (const map of Object.values(mapBroker)) {
                console.log(map)
                qty += (map[STOCK_QTY])
                sum += (map[STOCK_PRICE]) * qty
            }
            let aggPrice = sum/qty
            //update aggPrice in fb TODO
            console.log(aggPrice.toFixed(2))
            return aggPrice.toFixed(2) 
        } else {
            console.log("Fail to load firebase");
        }
    } catch (error) {
        console.error(error);
    }
}

/*
export const addHoldings = async(userID) => {
    try {
        var docRef = doc(db, userID,"holdings") //userID as placeholder for curr.uid
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            const dict =  docSnap.data()
            dict['JPM'] = {broker : { 'UOB' :{price:121,qty:10}}, name: 'JP Morgan', type: 'Finance'}
            setDoc(docRef,dict)
        }
    } catch (error) {
        console.error(error);
    }
}
*/


