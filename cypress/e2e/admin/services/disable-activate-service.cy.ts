/// <reference types="cypress" />

describe('Activar / Desactivar servicio (primer card dinámico)', () => {
  beforeEach(() => {
    cy.request('POST', 'https://localhost:7240/auth/login', {
      username: 'admin',
      clave: '123456',
    }).then((response) => {
      const token = response.body.token;

      cy.visit('http://localhost:4200/admin/servicios', {
        onBeforeLoad(win) {
          const w = win as unknown as Window;

          w.localStorage.setItem('token', token);
          w.localStorage.setItem('usuario', JSON.stringify(response.body));
        },
      });
    });
  }); 

  it('debe cambiar el estado del primer servicio y revertirlo', () => {
    cy.contains('Gestión de Servicios', { timeout: 10000 }).should('be.visible');

    cy.get('.service-card').first().as('cardServicio');

    cy.get('@cardServicio')
      .find('.status')
      .then(($el) => {
        const estadoInicial = $el.text().trim();

        if (estadoInicial.includes('Activo')) {
          cy.get('@cardServicio').contains('button', 'Desactivar').click();
          cy.get('@cardServicio').find('.status').should('contain.text', 'Inactivo');

          cy.get('@cardServicio').contains('button', 'Activar').click();
          cy.get('@cardServicio').find('.status').should('contain.text', 'Activo');
        } else {
          cy.get('@cardServicio').contains('button', 'Activar').click();
          cy.get('@cardServicio').find('.status').should('contain.text', 'Activo');

          cy.get('@cardServicio').contains('button', 'Desactivar').click();
          cy.get('@cardServicio').find('.status').should('contain.text', 'Inactivo');
        }
      });
  });
});
