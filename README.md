## K6 scenarios for Drupal Umami profile

### Installation
1. Install [K6](https://k6.io)
2. Install [Umami](./scripts/install-umami.sh)
3. Configure [access](./config.js) to Umami installation

### Usage
```
k6 run ./scenarios/NAME.js
```

### Limitations
The test scenarios are not compatible with Big Pipe module. Make sure it is uninstalled.

