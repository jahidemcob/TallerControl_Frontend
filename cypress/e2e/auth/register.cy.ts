/// <reference types="cypress" />
/// <reference types="mocha" />

describe('Registro de usuario', () => {
  it('debe registrar un usuario correctamente', () => {

    cy.visit('http://localhost:4200/register');

    cy.get('input[name="nombre"]').type('Juan Perez');
    cy.get('input[name="usuario"]').type('juan' + Date.now()); // evita duplicados
    cy.get('input[name="telefono"]').type('3001234567');
    cy.get('input[name="correo"]').type(`juan${Date.now()}@test.com`);
    cy.get('input[name="clave"]').type('123456');
    cy.get('input[name="confirmarClave"]').type('123456');

    // Verifica que el botón ya esté habilitado
    cy.get('button[type="submit"]').should('not.be.disabled');

    cy.get('button[type="submit"]').click();

    // Espera respuesta del backend
    cy.contains('Usuario registrado correctamente', { timeout: 10000 })
      .should('be.visible');

  });
});