/**
 * @enum ContractStatus
 * @description Ciclo de vida administrativo y legal del arrendamiento.
 * Controla la activación de los procesos de devengo de rentas.
 */
export enum ContractStatus {
  DRAFT = 'DRAFT',               // Borrador: En preparación, sin efectos legales.
  PENDING_SIGNATURE = 'PENDING_SIGNATURE', // Pendiente de firma: Documento generado.
  ACTIVE = 'ACTIVE',             // Activo: En vigor y generando facturas.
  TERMINATED = 'TERMINATED',     // Finalizado: Fin de vigencia natural del contrato.
  CANCELLED = 'CANCELLED',       // Rescindido: Cierre anticipado por mutuo acuerdo o incumplimiento.
  EXPIRED = 'EXPIRED',           // Caducado: Fecha fin superada sin cierre formal.
  LEGAL_DISPUTE = 'LEGAL_DISPUTE' // En litigio: Suspensión cautelar de ciertos procesos.
}