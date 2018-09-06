import chalk from 'chalk';
import { MuzikaLoggerLevel } from '../../../../core/common';

export function getChalkColor(level: MuzikaLoggerLevel): any {
  switch (level) {
    case MuzikaLoggerLevel.TRACE:
      return chalk.blue;
    case MuzikaLoggerLevel.DEBUG:
      return chalk.yellow;
    case MuzikaLoggerLevel.INFO:
    case MuzikaLoggerLevel.LOG:
      return chalk.gray;
    case MuzikaLoggerLevel.WARN:
    case MuzikaLoggerLevel.ERROR:
      return chalk.red;
    case MuzikaLoggerLevel.OFF:
    default:
      return chalk.white;
  }
}
