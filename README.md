# svg-componentify

## Install

`yarn add productboard-labs/svg-componentify -D`

## Idea

This tool seamlessly automate the work you have to do when you want from SVG file create React Component. At as a plus you will get optimized SVG structure.

From file like this:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 52.4 (67378) - http://www.bohemiancoding.com/sketch -->
    <title>Icon / 12 / Feature 2</title>
    <desc>Created with Sketch.</desc>
    <defs>
        <path d="M15,0 C15.6,0 16,0.4 16,1 L16,15 C16,15.6 15.6,16 15,16 L1,16 C0.4,16 0,15.6 0,15 L0,1 C0,0.4 0.4,0 1,0 L15,0 Z M14,14 L14,2 L2,2 L2,14 L14,14 Z M4,7 L12,7 L12,9 L4,9 L4,7 Z M4,4 L12,4 L12,6 L4,6 L4,4 Z M4,10 L8,10 L8,12 L4,12 L4,10 Z" id="path-1"></path>
    </defs>
    <g id="🎨-Style-guides" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="Notifications" transform="translate(-230.000000, -853.000000)">
            <g id="Icon-/-12-/-Feature-2" transform="translate(230.000000, 853.000000)">
                <g id="Icon-/-12-/-Feature">
                    <g id="Icon-/-16-/-Feature">
                        <mask id="mask-2" fill="white">
                            <use xlink:href="#path-1"></use>
                        </mask>
                        <use id="Mask" fill="#BCC4CC" fill-rule="evenodd" xlink:href="#path-1"></use>
                    </g>
                </g>
            </g>
        </g>
    </g>
</svg>
```

You will get React Component like this:

```js
/**
 * Copyright (c) 2018-present, ProductBoard, Inc.
 * All rights reserved.
 */

import React from "react";
import cx from "classnames";
import styles from "./Icon.styles";

const Feature = ({ className }: { className: string }) => (
  <svg viewBox="0 0 16 16" className={cx(className, styles.icon, "pb-icon")}>
    <path d="M15 0c.6 0 1 .4 1 1v14c0 .6-.4 1-1 1H1c-.6 0-1-.4-1-1V1c0-.6.4-1 1-1h14zm-1 14V2H2v12h12zM4 7h8v2H4V7zm0-3h8v2H4V4zm0 6h4v2H4v-2z" />
  </svg>
);

export default Feature;
```

## Configuration

> ⚠️ Currently there is not option to configure the transformator ([#1](https://github.com/productboard-labs/svg-componentify/issues/1)) but you can always do a Fork, right. 💪 If you want this happen write us to to the issue, we will prioritize it.

Exported binary `svg-componentify` has this possible configuration (via arguments)

- `--icon-path` (required) Where to look for SVG icons
- `--export-path` (required) Where to export optimized icon React components
- `--extension` (defaults to `react`)
- `--suffix` (defaults to `tsx`)
- `--only-staged` (defaults to `false`) Transform only staged svg icons files
- `--all` (defaults to `false`) Process all files
- `-v`, `--version` to print actual version of the tool
- `-f`, `--force` force all prompts to its default value

## Example

```json
{
  "scripts": {
    "icons:generate": " yarn run svg-componentify --icon-path='svg/app' --export-path='src/js/components/ui/Icons'"
  },
  "husky": {
    "hooks": {
      "pre-commit": "yarn run icons:generate --only-staged"
    }
  },
  "devDependencies": {
    "svg-componentify": "productboard/svg-componentify"
  }
}
```
