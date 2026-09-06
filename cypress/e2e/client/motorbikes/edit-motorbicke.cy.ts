/// <reference types="cypress" />

describe('Editar última motocicleta como cliente', () => {
  beforeEach(() => {
    // Login como cliente
    cy.request('POST', 'https://localhost:7240/auth/login', {
      username: 'prueba',
      clave: '123456',
    }).then((response) => {
      const token = response.body.token;

      cy.visit('http://localhost:4200/cliente', {
        onBeforeLoad(win) {
          const w = win as unknown as Window;

          w.localStorage.setItem('token', token);
          w.localStorage.setItem('usuario', JSON.stringify(response.body));
        },
      });
    });
  });

  it('debe editar la última motocicleta correctamente', () => {
    const nuevaMarca = 'Honda ' + Date.now();
    const nuevoModelo = 'CBR';
    const nuevoCilindraje = '600';
    const nuevoAnio = '2023';

    // Ir al módulo
    cy.contains('Motocicletas').click();
    cy.contains('Gestión de Motocicletas', { timeout: 10000 }).should('be.visible');

    // Asegurar que hay registros
    cy.get('.service-card').should('have.length.greaterThan', 0);

    // Editar la última
    cy.get('.service-card')
      .last()
      .within(() => {
        cy.contains('Editar').click();
      });

    // Formulario
    cy.contains('Editar Motocicleta', { timeout: 10000 }).should('be.visible');

    cy.get('input[name="marca"]').clear().type(nuevaMarca);
    cy.get('input[name="modelo"]').clear().type(nuevoModelo);
    cy.get('input[name="cilindraje"]').clear().type(nuevoCilindraje);
    cy.get('input[name="anio"]').clear().type(nuevoAnio);

    cy.get('button[type="submit"]').click();

    // Validar redirección automática al listado
    cy.contains('Gestión de Motocicletas', { timeout: 10000 }).should('be.visible');

    // Esperar a que las cards carguen
    cy.get('.service-card', { timeout: 10000 }).should('have.length.greaterThan', 0);

    // Validar que la última fue actualizada
    cy.get('.service-card')
      .last()
      .should('contain.text', nuevaMarca)
      .and('contain.text', nuevoModelo)
      .and('contain.text', nuevoCilindraje)
      .and('contain.text', nuevoAnio);
  });
});
