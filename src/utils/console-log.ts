
[ 'log', 'warn', 'error' ].forEach((methodName) => {
  // @ts-ignore
  const originalMethod = console[methodName];
  // @ts-ignore
  console[methodName] = (...args) => {
    originalMethod.apply(console, [ new Date().toISOString(), ...args ]);
  };
});

export {};
