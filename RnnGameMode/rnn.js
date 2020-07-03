class RNN {
  constructor(
    model,
    game,
    controller,
    batchSize = 5,
    memSize = 100,
    gamma = 0.7
  ) {
    this.batchSize = batchSize;
    this.memmory = [];
    this.gamma = gamma;
    this.memSize = memSize;
    this.model = model;
    this.game = game;
    this.controller = controller;
  }

  add(data) {
    /**
        adding object [[S A R s ],game_end]]
        **/
    this.memmory.push(data);
    if (this.memmory.length > this.memSize) {
      this.memmory.pop();
    }
  }

  getTrainingData() {
    const batch = [];
    for (let i = 0; i < this.batchSize.length; i++) {
      batch.push(this.memmory[this.getRandomizer(0, this.memmory.length - 1)]);
    }

    const inputs = [];
    const target = [];

    for (let i = 0; i < batch.length; i++) {
      const element = batch[i];
      //element = [[S A R s ],game_end]]
      const gameEnd = element[1];
      const [state, _, reward, next_state] = element[0];
      inputs[i] = state;
      const predict = this.model.predict(state);
      target[i] = predict;
      const action = predict.indexOf(Math.max(...predict));
      let q;
      if (gameEnd) {
        ///means am at the last stage and no other state
        q = reward;
      } else {
        q = reward + this.gamma * this.model.predict(next_state);
      }

      target[i][action] = q;
    }

    return { inputs, target };
  }

  getRandomizer(bottom, top) {
    return Math.floor(Math.random() * (1 + top - bottom)) + bottom;
  }

  train(wins = 100, learningRate = 0.00000000002, epsilon = 0.8) {
    ///rule of the game is to get upto a 1000 points
    const avg_training_time = [];
    const avg_loss = [];
    let batch_loss = 0;
    let maincoint = 0;
    const totalwins = [];
    let accuracy = 0;
    const totalloss = [];
    const target = 100;
    let tWins = 0;
    while (tWins < wins) {
      //play 1000 games
      for (let i = 0; i < 1000; i++) {
        console.log("Starting a new game");
        let tRewards = 0;

        this.game.startPlay();
        while (this.game.playing) {
          ///wait till game  ends
          const word = this.game.observe(); //get the env

          ///check if its ok to train then train
          if (this.memmory.length >= this.batchSize) {
            //train
            const batch = this.getTrainingData();
            this.model.run(batch.inputs, batch.outputs, 1, learningRate);
          }
          ///play game and add data

          //think
          //make action
          let action;
          if (math.random() > epsilon) {
            action = this.getRandomizer(0, 1);
          } else {
            const ans = this.model.predict(word);
            action = ans.indexOf(Math.max(...ans));
          }
          const reward = this.controller.action(action);
          tRewards = tRewards + reward;
          if (tRewards >= target) {
            this.game.endGame();
            tWins++;
          }

          const newState = this.game.observe();
          const dataToSave = [
            [word, action, reward, newState],
            !this.game.playing,
          ];
          this.add(dataToSave);
        }
        console.log("ending a game");
        console.log(`Total rewards ${tRewards}`);
        console.log(`Total Wins ${tWins}`);
      }
    }
  }
}
