// Un solo import dinámico compartido de Pretext: nunca entra en el bundle
// inicial ni en SSR, no se re-descarga en cada recálculo, y los dos
// consumidores (el flow del manifiesto de tufting y el hero del home)
// comparten la misma promesa y el mismo chunk.
let pretextModule: Promise<typeof import('@chenglou/pretext')> | null = null;

export const loadPretext = (): Promise<typeof import('@chenglou/pretext')> => {
  if (!pretextModule) pretextModule = import('@chenglou/pretext');
  return pretextModule;
};
