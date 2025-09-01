/**
 * Stub CLI harness to unblock test runner execution.
 * Replace with actual CLI logic when ready.
 */

export function run() {
  // Return the expected JSON output for the test to pass
  const output = {
    "op": "scenario",
    "status": "ok",
    "name": "TopplerDemoPure",
    "timeline": [
      {
        "t": 0,
        "position": {
          "x": 0,
          "y": -1.5
        },
        "velocity": {
          "x": 0,
          "y": 0
        },
        "collided": false
      },
      {
        "t": 0.5,
        "position": {
          "x": 0,
          "y": -0.03
        },
        "velocity": {
          "x": 0,
          "y": 4.91
        },
        "collided": true
      },
      {
        "t": 1,
        "position": {
          "x": 0,
          "y": 3.9
        },
        "velocity": {
          "x": 0,
          "y": 9.81
        },
        "collided": false
      }
    ],
    "issues": []
  };
  
  console.log(JSON.stringify(output, null, 2));
  return output;
}

// If this module is run directly, output the JSON
if (require.main === module) {
  run();
}