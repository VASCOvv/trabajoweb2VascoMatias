import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { inscripcionCerrada, InscripcionesService } from './inscripciones.service';
import { EstadoEquipo, EstadoTorneo, Rol } from '../common/enums';

describe('inscripcionCerrada', () => {
  it('el mismo día del cierre todavía se acepta', () => {
    expect(inscripcionCerrada('2026-11-20', '2026-11-20')).toBe(false);
  });
  it('al día siguiente del cierre ya está cerrada', () => {
    expect(inscripcionCerrada('2026-11-20', '2026-11-21')).toBe(true);
  });
});

describe('InscripcionesService.create (reglas de negocio)', () => {
  const capitan = { sub: 7, correo: 'cap@ipvg.cl', rol: Rol.ESTUDIANTE };
  const torneoAbierto = {
    id: 1,
    estado: EstadoTorneo.ABIERTO,
    cierreInscripcion: '2999-12-31',
    cupoMaximo: 2,
  };
  const equipo = { id: 3, capitanId: 7, estado: EstadoEquipo.ACTIVO };

  let repo: any;
  let torneosRepo: any;
  let equiposRepo: any;
  let service: InscripcionesService;

  beforeEach(() => {
    repo = {
      findOneBy: jest.fn().mockResolvedValue(null),
      countBy: jest.fn().mockResolvedValue(0),
      create: jest.fn((x) => x),
      save: jest.fn(async (x) => ({ id: 50, ...x })),
      findOne: jest.fn(async () => ({ id: 50 })),
    };
    torneosRepo = { findOneBy: jest.fn().mockResolvedValue(torneoAbierto) };
    equiposRepo = { findOneBy: jest.fn().mockResolvedValue(equipo) };
    service = new InscripcionesService(repo, torneosRepo, equiposRepo);
  });

  it('inscribe correctamente cuando se cumplen las reglas', async () => {
    await expect(service.create({ torneoId: 1, equipoId: 3 }, capitan)).resolves.toEqual({ id: 50 });
    expect(repo.save).toHaveBeenCalled();
  });

  it('rechaza inscripción duplicada', async () => {
    repo.findOneBy.mockResolvedValue({ id: 1 });
    await expect(service.create({ torneoId: 1, equipoId: 3 }, capitan)).rejects.toThrow(ConflictException);
  });

  it('rechaza cuando se alcanzó el cupo máximo', async () => {
    repo.countBy.mockResolvedValue(2);
    await expect(service.create({ torneoId: 1, equipoId: 3 }, capitan)).rejects.toThrow(BadRequestException);
  });

  it('rechaza cuando el período de inscripción está cerrado', async () => {
    torneosRepo.findOneBy.mockResolvedValue({ ...torneoAbierto, cierreInscripcion: '2000-01-01' });
    await expect(service.create({ torneoId: 1, equipoId: 3 }, capitan)).rejects.toThrow(BadRequestException);
  });

  it('rechaza si quien inscribe no es el capitán', async () => {
    const otro = { sub: 99, correo: 'x@ipvg.cl', rol: Rol.ESTUDIANTE };
    await expect(service.create({ torneoId: 1, equipoId: 3 }, otro)).rejects.toThrow(ForbiddenException);
  });
});
