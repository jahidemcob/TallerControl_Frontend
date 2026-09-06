/// <reference types="cypress" />

describe('Crear servicio desde admin', () => {
  beforeEach(() => {
    cy.request('POST', 'https://localhost:7240/auth/login', {
      username: 'admin',
      clave: '123456',
    }).then((response) => {
      const token = response.body.token;

      cy.visit('http://localhost:4200/admin', {
        onBeforeLoad(win) {
          const w = win as unknown as Window;

          w.localStorage.setItem('token', token);
          w.localStorage.setItem('usuario', JSON.stringify(response.body));
        },
      });
    });
  });

  it('debe crear un servicio y validarlo en la lista', () => {
    const nombre = 'Servicio Test ' + Date.now();

    cy.contains('Servicios').click();
    cy.contains('Gestión de Servicios', { timeout: 10000 }).should('be.visible');

    cy.get('.btn-create').click();

    cy.get('input[name="nombreServicio"]').type(nombre);
    cy.get('input[name="descripcion"]').type('Descripcion test');
    cy.get('input[name="precioBase"]').type('50000');

    cy.get('button[type="submit"]').click();

    // redirección manual
    cy.visit('http://localhost:4200/admin/servicios');

    cy.contains('Gestión de Servicios', { timeout: 10000 }).should('be.visible');

    // validación directa sin scroll
    cy.contains('.service-card', nombre, { timeout: 10000 })
      .should('exist')
      .within(() => {
        cy.contains('Activo').should('exist');
      });
  });
});
