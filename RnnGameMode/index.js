const {Savage,Savage_model} =  require('@king__somto/savage')
const mod = new Savage_model()
let savage_ = new Savage()
const math = require('mathjs')


let data = mod.loadDataFromCSV('./data/finance.csv',true)

data = mod.splitData(data,0.2)

const trainData = data[0]
const testData = data[1]

console.log(trainData.length);
console.log(testData.length);


let x = []
let y = []
for (let i = 0; i < trainData.length; i++) {
    const element = trainData[i];    
    y.push([element[4]])
    x.push(element.slice(1,4).map(function(item) {
        return parseInt(item, 10);
    }))
}

x = savage_.standardize(x)

mod.dataClassesDistribution(y)

mod.addDense({
    'output':3,
    'input':3,
    'activation':'sigmoid'
})

mod.addDense({
    'output':3,
    'activation':'sigmoid'
})


mod.addDense({
    'output':4,
    'activation':'relu'
})

mod.addDense({
    'output':1,
    'activation':'linear'
})


let itterations = 200000
let learningRate = 0.00000000002

mod.run(x,y,itterations,learningRate)
mod.modelSave('model.txt')


 x = []
 y = []
for (let i = 0; i < testData.length; i++) {
    const element = testData[i];    
    y.push([element[4]])
    x.push(element.slice(1,4).map(function(item) {
        return parseInt(item, 10);
    }))
}

x = savage_.standardize(x)

const min = 0
const max = x.length

let rand = parseInt(math.random(min,max))
console.log('predicted:',mod.predict(x[rand]));
console.log('actual:',y[rand])

rand = parseInt(math.random(min,max))
console.log('predicted:',mod.predict(x[rand]));
console.log('actual:',y[rand])

rand = parseInt(math.random(min,max))
console.log('predicted:',mod.predict(x[rand]));
console.log('actual:',y[rand])
