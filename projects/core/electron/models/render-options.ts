/**
 * This options are custom option that muzika renderer uses.
 */
export interface RenderOptions {
  // whether hiding navigation bar or not.
  // If this option is true, window hides navigation bar, so the window such as
  // loading screen needs to set this option.
  hideNavBar?: boolean;

  // whether hiding the title bar in the window or not.
  hideTitleBar?: boolean;

  // whether disable to showing the window when angular component view rendered.
  // If this option is true, renderer calls `remote.getCurrentWindow().show()` when
  // the angular component's `ngAfterViewInit()` called.
  disableShowAfterInitView?: boolean;
}
