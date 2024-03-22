## BTC Fee Watcher: Index schedule & math used


### Watcher Process:

```mermaid
graph TD
    A(Start Process) --> B[Load historic fee estimates from 2020 up to now into DB]
    B --> C[For each day, fee estimate in history, seed: moving average, fee index to DB]
    C --> Z(Start Index Watcher)
    C --> Y(Start API)
    Z --> D(Wait 10m)
    D --> G(Fetch Current Fee Estimate from mempool.space)
    G --> H(Create Fee Estimate Index = current Fee Estimate / today's Moving Average)
    H --> I[Store Fee Estimate, Moving Average, and Fee Estimate Index in DB]
    I --> D
    Z --> J(Wait 6h)
    J --> K{Have 6h passed?}
    K -->|Yes| L[Compress Fee Estimate and Fee Index Readings of Previous 6h]
    L --> M[Store Compressed readings in DB]
    M --> J
    K -->|No| J
    Z --> N(Wait 1 day)
    N --> E{Has the day changed?}
    E -->|Yes| F[Create Moving Average = sum of weighted Fee Estimates last 365 days / total weight]
    F --> N
    E -->|No| N
    Y --> Y1[Serve Routes:]
    Y1 --> O(Serve Current Fee Index)
    O --> P(Serve Fee Index History)
    P --> Q(Serve Fee Index WebSocket)
```
### Statistical details:

For more details on the exact math used to compute the values used for the fee index, refer:
https://colab.research.google.com/drive/1Fsn03dJQw3Agyii14YEic99WgKHzB_a-?usp=sharing

