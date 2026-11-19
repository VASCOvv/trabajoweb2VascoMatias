import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { determinarGanador, ResultadosService } from './resultados.service';
import { EstadoPartido, Modalidad, Rol } from '../common/enums';

describe('determinarGanador', () => {
  const partido = { equipoLocalId: 10, equipoVisitanteId: 20 };

  it('gana el local si tiene más puntaje', () => {
    expect(determinarGanador(partido, 3, 1, Modalidad.LIGA)).toBe(10);
  });

  it('gana el visitante si tiene más puntaje', () => {
    expect(determinarGanador(partido, 0, 2, Modalidad.ELIMINACION)).toBe(20);
  });

  it('empate en LIGA devuelve null', () => {
    expect(determinarGanador(partido, 2, 2, Modalidad.LIGA)).toBeNull();
  });

  it('empate en ELIMINACION lanza error', () => {
    expect(() => determinarGanador(partido, 1, 1, Modalidad.ELIMINACION)).toThrow(BadRequestException);
  });
});

describe('ResultadosService.create', () => {
  const admin = { sub: 1, correo: 'admin@ipvg.cl', rol: Rol.ADMIN };
  let repo: any;
  let partidosRepo: any;
  let service: ResultadosService;

  beforeEach(() => {
    repo = {
      create: jest.fn((x) => x),
      save: jest.fn(async (x) => ({ id: 99, ...x })),
      findOne: jest.fn(async () => ({ id: 99 })),
    };
    partidosRepo = { findOne: jest.fn(), update: jest.fn() };
    service = new ResultadosService(repo, partidosRepo);
  });

  it('lanza NotFound si el partido no existe', async () => {
    partidosRepo.findOne.mockResolvedValue(null);
    await expect(service.create({ partidoId: 5, puntajeLocal: 1, puntajeVisitante: 0 }, admin)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('lanza Conflict si el partido ya tiene resultado', async () => {
    partidosRepo.findOne.mockResolvedValue({
      id: 5,
      estado: EstadoPartido.FINALIZADO,
      resultado: { id: 1 },
      torneo: { modalidad: Modalidad.LIGA },
    });
    await expect(service.create({ partidoId: 5, puntajeLocal: 1, puntajeVisitante: 0 }, admin)).rejects.toThrow(
      ConflictException,
    );
  });

  it('guarda el resultado con ganador y marca el partido como FINALIZADO', async () => {
    partidosRepo.findOne.mockResolvedValue({
      id: 5,
      equipoLocalId: 10,
      equipoVisitanteId: 20,
      estado: EstadoPartido.PROGRAMADO,
      resultado: null,
      torneo: { modalidad: Modalidad.LIGA },
    });
    await service.create({ partidoId: 5, puntajeLocal: 0, puntajeVisitante: 3 }, admin);

    expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ ganadorId: 20, registradoPor: 1 }));
    expect(partidosRepo.update).toHaveBeenCalledWith(5, { estado: EstadoPartido.FINALIZADO });
  });
});
