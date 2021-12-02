let allQuestions = [];
let allAnswer = [];

//for test

allQuestions.push({
    "question": "Name:",
    "questionType": "input",
    "options": []
})

allQuestions.push({
    "question": "Sex:",
    "questionType": "choice",
    "options": [
        "Male",
        "Female",
        "Other"
    ]
})

const updateFillingFor = () => {
    let lastId = localStorage.getItem("lastId");
    if (lastId) {
        lastId = parseInt(lastId);
    } else {
        lastId = 0;
    }

    let fillingFor = document.getElementById('fillingFor');
    let fillingFor2 = document.getElementById('fillingFor2');
    fillingFor.innerText = lastId + 1;
    fillingFor2.innerText = lastId + 1;
}

const readInitial = () => {
    fetch("./questions.csv")
        // fetch("https://quiz.bloggernepal.com/questions.json")
        .then(response => {

            // console.log(response);

            // let data = response.body.toString();

            // console.log(data);
            return response.text()
        })
        .then(data => {
            // console.log(data);

            let csvData = Papa.parse(data);

            console.log(csvData);

            let questions = [];
            csvData.data.forEach((element, i) => {
                // ignore last and first
                if (i != 0 && i != csvData.data.length - 1) {
                    let options = element[2];
                    if (options.length > 0) {
                        options = options.split("---");
                    } else {
                        options = []
                    }
                    questions.push({
                        question: element[0],
                        questionType: element[1],
                        options
                    })
                }
            })

            populateQuestions(questions);
            updateFillingFor();
        })
}

readInitial();

function populateQuestions(questions) {

    allQuestions = questions;

    let questionsHolder = document.getElementById("questions");
    questionsHolder.innerText = "";
    // console.log(questions);

    questions.forEach((element, i) => {
        // console.log(element)

        // 1 create a div
        let div = document.createElement("div");

        // 2 create h2 for question
        let h2 = document.createElement("h2");
        h2.innerText = (i + 1) + ") " + element.question;

        // 3 add (appendChild) h2 to div
        div.appendChild(h2)

        // check question type

        // if it is choise, create radio and append to div
        if (element.questionType == 'choice' || element.questionType == 'choiceInput') {
            element.options.forEach((option, j) => {
                let input = document.createElement("input");
                input.setAttribute("type", "radio");
                input.setAttribute("id", "question-" + i + "-" + j);
                input.setAttribute("name", "opt" + i);
                let label = document.createElement("label");
                label.innerText = option;
                // label.appendChild(input);
                label.insertBefore(input, label.firstChild);
                div.appendChild(label);

                let br = document.createElement("br");
                div.appendChild(br);
            });
        }

        // if mchoice create checkbox and append to div
        if (element.questionType == 'mChoice' || element.questionType == 'mChoiceInput') {
            element.options.forEach((option, j) => {
                let input = document.createElement("input");
                input.setAttribute("type", "checkbox");
                input.setAttribute("id", "question-" + i + "-" + j);
                let label = document.createElement("label");
                label.innerText = option;
                label.insertBefore(input, label.firstChild);
                div.appendChild(label)

                let br = document.createElement("br");
                div.appendChild(br);
            });
        }

        // if it is input
        // create input and append it it div
        if (element.questionType == 'input' || element.questionType == 'choiceInput' || element.questionType == 'mChoiceInput') {
            let input = document.createElement("input");
            input.setAttribute("id", 'question-' + i);
            div.appendChild(input);
        }

        // last add (appendChild) div to questionsHolder
        questionsHolder.appendChild(div);
    });
}

const populate = () => {
    populateQuestions(allQuestions);
}

const save = () => {
    allAnswer = [];
    console.log('Save called!')
    console.log(allQuestions.length, allAnswer.length)

    allQuestions.forEach((question, i) => {
        // console.log(question);
        let answer = {
            ...question
        }
        if (question.questionType == 'choice' || question.questionType == 'choiceInput') {
            question.options.forEach((option, j) => {
                let input = document.getElementById("question-" + i + "-" + j);
                if (input.checked) {
                    answer.choice = option;
                    // console.log(option);
                }
            });
        }

        if (question.questionType == 'mChoice' || question.questionType == 'mChoiceInput') {

            let selected = [];
            question.options.forEach((option, j) => {
                let input = document.getElementById("question-" + i + "-" + j);
                if (input.checked) {
                    selected.push(option)
                    // console.log(option);
                }
            });
            answer.selected = selected;
        }

        if (question.questionType == 'input' || question.questionType == 'choiceInput' || question.questionType == 'mChoiceInput') {
            let input = document.getElementById("question-" + i);
            // console.log(input.value);
            answer.input = input.value
        }

        allAnswer.push(answer);
    })

    console.log(allAnswer);
    saveToLocal();
    updateFillingFor();
    populate();
}


const saveToLocal = () => {
    let lastId = localStorage.getItem("lastId");
    if (lastId) {
        lastId = parseInt(lastId);
    } else {
        lastId = 0;
    }

    lastId = lastId + 1;
    localStorage.setItem("lastId", lastId);

    localStorage.setItem("respondent-" + lastId, JSON.stringify(allAnswer))

    createResponseFile("respondent-" + lastId);

    createCummulativeResponseFile();
}

const createResponseFile = (filename) => {
    let downloadHolder = document.getElementById("downloadHolder");
    let a = document.createElement("a");

    let message = "Name,Age\nSagar,26\nAmrit,28\nNawaraj,14"
    // console.log(message);

    message = responseToCSVString(allAnswer)

    let blob = new Blob([message], {
        type: 'text/csv;charset=utf-8;'
    });

    let url = URL.createObjectURL(blob);
    a.href = url;
    a.download = filename + ".csv";
    a.innerText = 'Download';

    a.click();

    // downloadHolder.append(a);
}

const responseToCSVString = (answers) => {
    let message = 'question, questionType, options, choice, selected, input\n';

    answers.forEach(answer => {
        if (answer.question) {
            message = message + answer.question + ','
        } else {
            message = message + ','
        }
        if (answer.questionType) {
            message = message + answer.questionType + ','
        } else {
            message = message + ','
        }
        if (answer.options) {
            let options = [...answer.options]
            options = options.join("---")
            message = message + options + ','
        } else {
            message = message + ','
        }
        if (answer.choice) {
            message = message + answer.choice + ','
        } else {
            message = message + ','
        }

        if (answer.selected) {
            let selected = [...answer.selected]
            selected = selected.join("---")
            message = message + selected + ','
        } else {
            message = message + ','
        }
        if (answer.input) {
            message = message + answer.input + ','
        } else {
            message = message + ','
        }
        message = message + '\n'
    });
    return message;
}

const createCummulativeResponseFile = () => {
    let lastId = localStorage.getItem("lastId");
    if (lastId) {
        lastId = parseInt(lastId);
    } else {
        lastId = 0;
    }

    if (lastId == 0) {
        return;
    }

    let message = '';

    allQuestions.forEach(element => {
        message = message + element.question + ',,'
    });
    message = message + '\n';




    for (let i = 1; i <= lastId; i++) {
        let keyName = "respondent-" + i;
        let answers = JSON.parse(localStorage.getItem(keyName));
        message = message + responseToCSVStringForCumulative(answers)

    }

    let a = document.createElement("a");


    let blob = new Blob([message], {
        type: 'text/csv;charset=utf-8;'
    });

    let url = URL.createObjectURL(blob);
    a.href = url;
    a.download = 'Upto-' + lastId + ".csv";
    a.innerText = 'Download';

    a.click();
}

const responseToCSVStringForCumulative = (answers) => {
    let message = '';
    answers.forEach(answer => {

        if (answer.choice) {
            message = message + answer.choice + ','
        }

        if (answer.selected) {
            let selected = [...answer.selected]
            selected = selected.join("---")
            message = message + selected + ','
        }

        if (!answer.choice && !answer.selected) {
            message = message + ','

        }
        if (answer.input) {
            message = message + answer.input + ','
        } else {
            message = message + ','
        }
    });
    message = message + '\n'

    return message;
}