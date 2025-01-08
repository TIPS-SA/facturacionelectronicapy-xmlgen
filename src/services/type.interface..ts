interface XmlgenConfig {
  defaultValues?: boolean;
  arrayValuesSeparator?: string;
  errorSeparator?: string;
  errorLimit?: number;
  redondeoSedeco?: boolean;
  decimals?: number;
  taxDecimals?: number;
  pygDecimals?: number;
  pygTaxDecimals?: number;
  /**
   * Cantidad de decimales para resultados parciales de base de impuestos (dBasExe, dBasGravIva, dLiqIVAItem)
   */
  partialTaxDecimals?: number;
  userObjectRemove?: boolean;
  test: boolean; //Indica si se debe generar XML en formato de TEST, por default false, a partir del 21/04/2023
  sum0_000001SuffixBeforeToFixed: boolean;
  //debug?: boolean
}

export { XmlgenConfig };
