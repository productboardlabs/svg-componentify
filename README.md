# svg-componentify

## Install

`yarn add productboard/svg-componentify -D`

## Idea

## Configuration

Exported binary `svg-componentify` has this possible configuration (via arguments)

`--icon-path` (required) Where to look for SVG icons
`--export-path` (required) Where to export optimized icon React components
`--extension` (defaults to `react`)
`--suffix` (defaults to `tsx`)
`--only-staged` (defaults to `false`) Transform only staged svg icons files

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
