/* eslint-disable max-len,no-console */
import express from 'express';
import cors from 'cors';
import LoggerService from './service/logger.service.js';
import movieRoutes from './controller/movie.controller.js';

const app = express();
const loggerService = LoggerService('index');

app.use(cors());
app.use('/api/v1/movies', movieRoutes);

app.listen(process.env.API_PORT, () => {
  console.log(
    '\n'
      + '\n'
      + '____    __    ____  _______  __        ______   ______   .___  ___.  _______ \n'
      + '\\   \\  /  \\  /   / |   ____||  |      /      | /  __  \\  |   \\/   | |   ____|\n'
      + " \\   \\/    \\/   /  |  |__   |  |     |  ,----'|  |  |  | |  \\  /  | |  |__   \n"
      + '  \\            /   |   __|  |  |     |  |     |  |  |  | |  |\\/|  | |   __|  \n'
      + "   \\    /\\    /    |  |____ |  `----.|  `----.|  `--'  | |  |  |  | |  |____ \n"
      + '    \\__/  \\__/     |_______||_______| \\______| \\______/  |__|  |__| |_______|\n'
      + '                                                                             \n'
      + '  ______   .___  ___.  _______  .______           ___      .______    __     \n'
      + ' /  __  \\  |   \\/   | |       \\ |   _  \\         /   \\     |   _  \\  |  |    \n'
      + '|  |  |  | |  \\  /  | |  .--.  ||  |_)  |       /  ^  \\    |  |_)  | |  |    \n'
      + '|  |  |  | |  |\\/|  | |  |  |  ||   _  <       /  /_\\  \\   |   ___/  |  |    \n'
      + "|  `--'  | |  |  |  | |  '--'  ||  |_)  |     /  _____  \\  |  |      |  |    \n"
      + ' \\______/  |__|  |__| |_______/ |______/     /__/     \\__\\ | _|      |__|    \n'
      + '                                                                             \n'
      + '\n',
  );
  loggerService.info('App listening on port %d', process.env.API_PORT);
});
