/// <reference types="cypress" />

describe('Activar / Desactivar usuario (ID 5)', () => {
  beforeEach(() => {
    cy.request('POST', 'https://localhost:7240/auth/login', {
      username: 'admin',
      clave: '123456',
    }).then((response) => {
      const token = response.body.token;

      cy.visit('http://localhost:4200/admin/usuarios', {
        onBeforeLoad(win) {
          const w = win as unknown as Window;

          w.localStorage.setItem('token', token);
          w.localStorage.setItem('usuario', JSON.stringify(response.body));
        },
      });
    });
  });

  it('debe cambiar el estado del usuario con ID 5 y revertirlo', () => {
    cy.contains('Gestión de Usuarios', { timeout: 10000 }).should('be.visible');

    cy.get('.body-table tbody tr').contains('td', '5').parents('tr').as('filaUsuario');

    cy.get('@filaUsuario')
      .find('td')
      .eq(5)
      .then(($el) => {
        const estadoInicial = $el.text().trim();

        if (estadoInicial.includes('Activo')) {
          cy.get('@filaUsuario').within(() => {
            cy.contains('button', 'Desactivar').click();
          });

          cy.get('@filaUsuario').find('td').eq(5).should('contain.text', 'Inactivo');

          cy.get('@filaUsuario').within(() => {
            cy.contains('button', 'Activar').click();
          });

          cy.get('@filaUsuario').find('td').eq(5).should('contain.text', 'Activo');
        } else {
          cy.get('@filaUsuario').within(() => {
            cy.contains('button', 'Activar').click();
          });

          cy.get('@filaUsuario').find('td').eq(5).should('contain.text', 'Activo');

          cy.get('@filaUsuario').within(() => {
            cy.contains('button', 'Desactivar').click();
          });

          cy.get('@filaUsuario').find('td').eq(5).should('contain.text', 'Inactivo');
        }
      });
  });
});
