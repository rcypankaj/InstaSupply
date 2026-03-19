if (__DEV__) {
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    if (error?.message?.includes('Tried to register two views with the same name')) {
      return;
    }
    originalHandler(error, isFatal);
  });
}
