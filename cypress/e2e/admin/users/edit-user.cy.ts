/// <reference types="cypress" />

describe('Editar último usuario con username único', () => {
  beforeEach(() => {
    cy.request('POST', 'https://localhost:7240/auth/login', {
      username: 'admin',
      clave: '123456',
    }).then((response) => {
      const token = response.body.token;

      cy.visit('http://localhost:4200/admin/usuarios', {
        onBeforeLoad(win) {
          const w = win as any;
          w.localStorage.setItem('token', token);
          w.localStorage.setItem('usuario', JSON.stringify(response.body));
        },
      });
    });
  });

  it('debe editar el último usuario de la tabla sin duplicados', () => {
    const nuevoUsuario = 'PEditar' + Date.now();

    (cy as any).intercept('PUT', '**/users/**').as('updateUser');

    cy.contains('Gestión de Usuarios').should('be.visible');

    cy.get('.body-table tbody tr').should('have.length.greaterThan', 0);

    // scroll al contenedor
    // @ts-ignore
    cy.get('.table-scroll').scrollTo('bottom');

    // editar última fila
    cy.get('.body-table tbody tr')
      .last()
      .should('be.visible')
      .within(() => {
        cy.get('.btn-edit').click({ force: true });
      });

    cy.contains('Editar Usuario').should('be.visible');

    // editar username
    cy.get('input[name="nombreUsuario"]').clear().type(nuevoUsuario);

    // guardar
    cy.get('button[type="submit"]').click();

    // esperar backend
    cy.wait('@updateUser').its('response.statusCode').should('eq', 200);

    // volver a tabla
    cy.contains('Gestión de Usuarios', { timeout: 10000 }).should('be.visible');

    // scroll nuevamente
    // @ts-ignore
    cy.get('.table-scroll').scrollTo('bottom');

    // validar cambio
    cy.get('.body-table tbody tr').last().should('contain.text', nuevoUsuario);
  });
});
