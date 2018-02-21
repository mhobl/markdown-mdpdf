'use babel';

let fs;
let mdpdf;
let path;
let util;

function loadDeps() {
  fs = require('fs');
  mdpdf = require('mdpdf');
  path = require('path');
  util = require('./util');
}

module.exports = {
  config: {
    format: {
      title: 'Page Format',
      type: 'string',
      order: 1,
      default: 'A4',
      enum: ['A3', 'A4', 'A5', 'Legal', 'Letter', 'Tabloid']
    },
    border: {
      title: 'Border Size',
      type: 'object',
      order: 2,
      properties: {
        top: {
          title: 'Top border size',
          type: 'string',
          order: 1,
          default: '10mm'
        },
        left: {
          title: 'Left border size',
          type: 'string',
          order: 2,
          default: '20mm'
        },
        bottom: {
          title: 'Bottom border size',
          type: 'string',
          order: 3,
          default: '10mm'
        },
        right: {
          title: 'Right border size',
          type: 'string',
          order: 4,
          default: '20mm'
        }
      }
    },
    emoji: {
      title: 'Enable Emojis',
      description: 'Convert :tagname: style tags to Emojis',
      order: 3,
      type: 'boolean',
      default: true
    },
    debug: {
      title: 'Activate debug html',
      description: 'Creates in debug.html file in the same folder as the PDF',
      order: 4,
      type: 'boolean',
      default: false
    },
    styleConfiguration1: {
      type: 'object',
      title: 'Style configuration',
      order: 5,
      properties: {
        styleName: {
          title: 'Name of the style configuration',
          type: 'string',
          order: 1,
          default: 'Default style'
        },
        styleSheet: {
          title: 'Path to style sheet',
          type: 'string',
          order: 2,
          default: '.\\'
        },
        header: {
          title: 'Path to header.html',
          type: 'string',
          order: 3,
          default: '.\\header.html'
        },
        headerHeight: {
          title: 'Height of the header.html',
          type: 'string',
          order: 4,
          default: '50px'
        },
        footer: {
          title: 'Path to footer.html',
          type: 'string',
          order: 5,
          default: '.\\footer.html'
        },
        footerHeight: {
          title: 'Height of the footer.html',
          type: 'string',
          order: 6,
          default: '50px'
        }
      }
    }
  },

  activate: function() {
    loadDeps();
    atom.commands.add('atom-workspace', 'markdown-mdpdf:convert', this.convert);
  },

  convert: async function() {
    try{
      const conf = atom.config.get('markdown-mdpdf');
      const activeEditor = atom.workspace.getActiveTextEditor();
      const inPath = activeEditor.getPath();
      const outPath = util.getOutputPath(inPath);
      var parsePath = path.parse(outPath);
      const debugPath = path.join(parsePath.dir, 'debug.html');
      const options = {
        debug: conf.debug ? debugPath : null,
        source: inPath,
        destination: outPath,
        style: util.isCssFile(conf.styleConfiguration1.styleSheet) ? conf.styleConfiguration1.styleSheet : null,
        ghStyle: !util.isCssFile(conf.styleConfiguration1.styleSheet),
        defaultStyle: !util.isCssFile(conf.styleConfiguration1.styleSheet),
        noEmoji: !conf.emoji,
        header: util.isHtmlFile(conf.styleConfiguration1.header) ? conf.styleConfiguration1.header : null,
        footer: util.isHtmlFile(conf.styleConfiguration1.footer) ? conf.styleConfiguration1.footer : null,
        pdf: {
          format: conf.format,
          quality: 100,
          header: {
            height: conf.styleConfiguration1.headerHeight
          },
          footer: {
            height: conf.styleConfiguration1.footerHeight
          },
          border: {
            top: conf.border.top,
            left: conf.border.left,
            bottom: conf.border.bottom,
            right: conf.border.right
          },
        }
      };
      atom.notifications.addInfo('Converting to PDF...', {icon: 'markdown'});
      await mdpdf.convert(options);
      atom.notifications.addSuccess(
        'Converted successfully.',
        { detail: 'Output in ' + outPath, icon: 'file-pdf' }
      );
    } catch(err) {
        const remote = require('remote');
        atom.notifications.addError(
          'Markdown-mdpdf: Error. Check console for more information.',
          {
            buttons: [{
              className: 'md-pdf-err',
              onDidClick: () => remote.getCurrentWindow().openDevTools(),
              text: 'Open console',
            }]
          }
        )
        console.log(err.stack);
        return;
      }
    }
  }
