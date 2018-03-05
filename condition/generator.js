const conditionNum = 9;
const fs = require('fs');
let savedSequences = [];


var shuffle = (arr) => {
    for(let i = arr.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

var generateSequence = () => {
    let order = [[16, 0], [16, 0.5], [16, 1],
                 [32, 0], [32, 0.5], [32, 1],
                 [48, 0], [48, 0.5], [48, 1]];
    return shuffle(order);
};

var generateConditionFiles = (location, max_id) => {
    for(let i = 0; i < max_id; i++){
        let userSeqs = [];
        for(let j = 0; j < 3; j++){
            let seq = generateSequence();
            while(isDuplicated(seq)){
                seq = generateSequence();
            }
            savedSequences.push(seq);
            userSeqs.push(seq);
        }
        saveFile(location, i, userSeqs);
    }
};

var isDuplicated = (currentSeq) => {
    for(let i = 0; i < savedSequences.length; i++){
        if(JSON.stringify(currentSeq) === JSON.stringify(savedSequences[i]))
            return true;
    }
    return false;
}

var saveFile = (location, id, data) => {
    const userConditions = {
        id: `${location}_${id+1}`,
        mouse: data[0],
        swipe: data[1],
        dwell: data[2]
    };
    fs.writeFile(`./${userConditions.id}.json`, JSON.stringify(userConditions, null, 4), (err) => {
        if(err){
            console.log('Error at writing a file.');
            return;
        }
        console.log('done');
    });
};



generateConditionFiles('usa', 10);
generateConditionFiles('tw', 10);
