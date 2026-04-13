package lpnu.backend.controllers;

import lpnu.backend.models.Instrument;
import lpnu.backend.services.InstrumentService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/instruments")
public class InstrumentController {

    private final InstrumentService service;

    public InstrumentController(InstrumentService service) {
        this.service = service;
    }

    @GetMapping
    public List<Instrument> getAll(@RequestHeader("X-Owner-ID") String ownerId) {
        return service.getAllByOwner(ownerId);
    }

    @PostMapping
    public Instrument create(@RequestBody Instrument instrument, @RequestHeader("X-Owner-ID") String ownerId) {
        instrument.setOwnerId(ownerId);
        return service.addInstrument(instrument);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.deleteInstrument(id);
    }

    @DeleteMapping
    public void deleteAll(@RequestHeader("X-Owner-ID") String ownerId) {
        service.clearByOwner(ownerId);
    }

    @PutMapping("/{id}")
    public Instrument update(@PathVariable String id, @RequestBody Instrument instrument) {
        return service.updateInstrument(id, instrument);
    }

    @PutMapping("/{id}/position")
    public Instrument updatePosition(@PathVariable String id, @RequestParam int x, @RequestParam int y) {
        return service.updatePosition(id, x, y);
    }
}