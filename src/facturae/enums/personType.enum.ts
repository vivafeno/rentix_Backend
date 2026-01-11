/**
 * Tipos de Persona según esquema Facturae 3.2.x
 * Se corresponde con los nodos XML raíz de la entidad.
 */
export enum PersonType {
  // Se mapea al tag <Individual>
  INDIVIDUAL = 'Individual', 
  
  // Se mapea al tag <LegalEntity>
  LEGAL_ENTITY = 'LegalEntity', 
}