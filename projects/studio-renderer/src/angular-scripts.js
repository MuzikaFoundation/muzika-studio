process.browser = true;
window.jQuery = window.$ = require("jquery");
[
  "froala-editor",
  "froala-editor/js/languages/ko",
  "froala-editor/js/plugins/link.min",
  "froala-editor/js/plugins/table.min",
  "froala-editor/js/plugins/url.min",
  "froala-editor/js/plugins/colors.min",
  "froala-editor/js/plugins/align.min",
  "froala-editor/js/plugins/emoticons.min",
  "froala-editor/js/plugins/font_size.min",
  "froala-editor/js/plugins/code_view.min",
  "froala-editor/js/plugins/lists.min",
  "froala-editor/js/plugins/paragraph_style.min",
  "froala-editor/js/plugins/image.min",
  "froala-editor/js/plugins/video.min",
  "froala-editor/js/plugins/image_manager.min"
].forEach(path => require(path)(window, $));
