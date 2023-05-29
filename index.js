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
    '____    __    ____  _______  __        ______   ______   .___  ___.  _______ \n'
      + '\\   \\  /  \\  /   / |   ____||  |      /      | /  __  \\  |   \\/   | |   ____|\n'
      + " \\   \\/    \\/   /  |  |__   |  |     |  ,----'|  |  |  | |  \\  /  | |  |__   \n"
      + '  \\            /   |   __|  |  |     |  |     |  |  |  | |  |\\/|  | |   __|  \n'
      + "   \\    /\\    /    |  |____ |  `----.|  `----.|  `--'  | |  |  |  | |  |____ \n"
      + '    \\__/  \\__/     |_______||_______| \\______| \\______/  |__|  |__| |_______|\n'
      + '                                                                             \n'
      + '  ______  __  .__   __.  _______ .___  ___.      ___   .___________. _______ \n'
      + ' /      ||  | |  \\ |  | |   ____||   \\/   |     /   \\  |           ||   ____|\n'
      + "|  ,----'|  | |   \\|  | |  |__   |  \\  /  |    /  ^  \\ `---|  |----`|  |__   \n"
      + '|  |     |  | |  . `  | |   __|  |  |\\/|  |   /  /_\\  \\    |  |     |   __|  \n'
      + '|  `----.|  | |  |\\   | |  |____ |  |  |  |  /  _____  \\   |  |     |  |____ \n'
      + ' \\______||__| |__| \\__| |_______||__|  |__| /__/     \\__\\  |__|     |_______|\n'
      + '                                                  '
    + '                           \n'
      + '\n',
  );

  loggerService.info('App listening on port %d', process.env.API_PORT);
});
