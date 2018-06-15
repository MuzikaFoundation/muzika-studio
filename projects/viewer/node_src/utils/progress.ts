import {combineLatest, Subscription, BehaviorSubject, Observable} from 'rxjs';
import {Transform} from 'stream';


/**
 * Progress interface represents progress in some works. Clients often want to
 * know how the work done.
 */
export interface Progress {
  /**
   * callback function that is called when the percent is changed.
   * @param percent current percent.
   */
  onChange: Observable<number>;
  _onChangeSubject: BehaviorSubject<number>;
  percentageWeight: number;
}

/**
 * ProgressSet represents total progress of works. It has progress array and if
 * all progresses are done, getProgressPercent() function will return 1. And if
 * it doesn't have progresses (progress array is empty), it always return 0.
 */
export class ProgressSet implements Progress {
  percentageWeight: number;
  onChange: Observable<number>;
  _onChangeSubject: BehaviorSubject<number>;
  progresses: Progress[];
  isStarted = false;
  private _onChangeSubscription: Subscription;

  constructor(progresses: Progress[], weight = 1) {
    this.progresses = progresses;
    this._onChangeSubject = new BehaviorSubject<number>(0);
    this.onChange = this._onChangeSubject.asObservable();
    this.percentageWeight = weight;
  }

  /**
   * Starts to track this progress. The onProgressCallback that is called when
   * the percentage changed after start() method called.
   */
  start() {
    this.isStarted = true;
    this._onChangeSetup();
  }

  /**
   * Adds an additional progress.
   * @param {Progress} progress addtional progress to be tracked.
   */
  registerProgress(progress: Progress) {
    this.progresses.push(progress);
    this._onChangeSetup();
  }

  private _onChangeSetup() {
    if (this._onChangeSubscription) { // remove previous subscription
      this._onChangeSubscription.unsubscribe();
    }
    this._onChangeSubscription = combineLatest(...this.progresses.map(progress => progress.onChange))
      .subscribe((percents: number[]) => {
        if (!this.progresses.length || !this.isStarted) {
          return;
        }
        this._onChangeSubject.next(percents.reduce((prev, current) => {
          return (current) ? (prev + current) : prev;
        }, 0) / this.progresses.length);
      });
  }
}

/**
 * ManualProgress is a progress that its percent is decided manually by calling
 * function setProgressPercent() function.
 */
export class ManualProgress implements Progress {
  percentageWeight: number;
  onChange: Observable<number>;
  _onChangeSubject: BehaviorSubject<number>;

  constructor() {
    this._onChangeSubject = new BehaviorSubject<number>(0);
    this.onChange = this._onChangeSubject.asObservable();
  }

  /**
   * Sets the percent of the progress.
   * @param {number} percent the percent that represents how work done. It should
   * be between 0 and 1.
   */
  setProgressPercent(percent: number) {
    // if the percent is over 1 or lower than 0, set to boundary.
    if (percent > 1) {
      percent = 1;
    } else if (percent < 0) {
      percent = 0;
    }

    this._onChangeSubject.next(percent);
  }
}

/**
 * ProgressStream is a progress that its percent is determined by the length data
 * read and the total length. When constructing, it should have total length in
 * options.
 */
export class ProgressStream extends Transform implements Progress {
  percentageWeight: number;
  onChange: Observable<number>;
  _onChangeSubject: BehaviorSubject<number>;
  private _totalSize: number;
  private _readLength = 0;

  constructor(options) {
    super(options);
    this._totalSize = options.totalSize;
    this._onChangeSubject = new BehaviorSubject<number>(0);
    this.onChange = this._onChangeSubject.asObservable();
  }

  _transform(data, encoding, callback) {
    this._readLength += data.length;
    this.push(data);
    this._onChangeSubject.next(this._getProgressPercent());
    callback();
  }

  private _getProgressPercent(): number {
    return (this._totalSize) ? this._readLength / this._totalSize : 1;
  }
}

