/// <reference types="cypress" />

describe('Activar / Desactivar motocicleta (primer card dinámico)', () => {
  beforeEach(() => {
    // Login como cliente
    cy.request('POST', 'https://localhost:7240/auth/login', {
      username: 'prueba',
      clave: '123456',
    }).then((response) => {
      const token = response.body.token;

      cy.visit('http://localhost:4200/cliente/motocicletas', {
        onBeforeLoad(win) {
          const w = win as unknown as Window;

          w.localStorage.setItem('token', token);
          w.localStorage.setItem('usuario', JSON.stringify(response.body));
        },
      });
    });
  });

  it('debe cambiar el estado de la primera motocicleta y revertirlo', () => {
    // Validar que el módulo cargó
    cy.contains('Gestión de Motocicletas', { timeout: 10000 }).should('be.visible');

    // Asegurar que hay cards
    cy.get('.service-card').should('have.length.greaterThan', 0);

    // Tomar la primera motocicleta
    cy.get('.service-card').first().as('cardMoto');

    // Evaluar estado dinámicamente
    cy.get('@cardMoto')
      .find('.status')
      .then(($el) => {
        const estadoInicial = $el.text().trim();

        if (estadoInicial.includes('Activo')) {
          cy.get('@cardMoto').contains('button', 'Desactivar').click();

          cy.get('@cardMoto').find('.status').should('contain.text', 'Inactivo');

          cy.get('@cardMoto').contains('button', 'Activar').click();

          cy.get('@cardMoto').find('.status').should('contain.text', 'Activo');
        } else {
          cy.get('@cardMoto').contains('button', 'Activar').click();

          cy.get('@cardMoto').find('.status').should('contain.text', 'Activo');

          cy.get('@cardMoto').contains('button', 'Desactivar').click();

          cy.get('@cardMoto').find('.status').should('contain.text', 'Inactivo');
        }
      });
  });
});
