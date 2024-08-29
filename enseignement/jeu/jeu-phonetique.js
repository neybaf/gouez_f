 let currentQuestion = 0;
        let questions = [];

        async function loadQuestions() {
            const response = await fetch('question-phonetique.csv');
            const data = await response.text();
            const lines = data.split('\n').filter(line => line.trim() !== '');
            for (let line of lines) {
                const [audioFile, option1, option2, correctOption] = line.split(',');
                questions.push({ audioFile, option1, option2, correctOption });
            }
            loadQuestion();
        }

        function loadQuestion() {
            if (currentQuestion < questions.length) {
                const question = questions[currentQuestion];
                document.getElementById('audio-player').src = question.audioFile;
                document.getElementById('label-option1').textContent = question.option1;
                document.getElementById('label-option2').textContent = question.option2;
                document.querySelector('input[name="option"]:checked')?.checked = false;
                document.getElementById('result').textContent = '';
            } else {
                document.getElementById('game-container').innerHTML = '<h2>Vous avez terminé le jeu !</h2>';
            }
        }

        document.getElementById('submit-answer').addEventListener('click', function() {
            const selectedOption = document.querySelector('input[name="option"]:checked');
            if (selectedOption) {
                const question = questions[currentQuestion];
                const isCorrect = selectedOption.value === question.correctOption;
                document.getElementById('result').textContent = isCorrect ? 'Bonne réponse !' : 'Mauvaise réponse.';
                currentQuestion++;
                setTimeout(loadQuestion, 2000);
            } else {
                document.getElementById('result').textContent = 'Veuillez sélectionner une option.';
            }
        });

        loadQuestions();