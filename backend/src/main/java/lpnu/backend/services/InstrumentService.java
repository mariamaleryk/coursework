package lpnu.backend.services;

import lpnu.backend.models.Instrument;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class InstrumentService {
    private final Map<String, Instrument> repository = new ConcurrentHashMap<>();

    public List<Instrument> getAllByOwner(String ownerId) {
        return repository.values().stream()
                .filter(inst -> ownerId.equals(inst.getOwnerId()))
                .collect(Collectors.toList());
    }

    public Instrument addInstrument(Instrument instrument) {
        repository.put(instrument.getId(), instrument);
        return instrument;
    }

    public void deleteInstrument(String id) {
        repository.remove(id);
    }

    public void clearByOwner(String ownerId) {
        repository.values().removeIf(inst -> ownerId.equals(inst.getOwnerId()));
    }

    public Instrument updateInstrument(String id, Instrument updated) {
        if (repository.containsKey(id)) {
            updated.setId(id);
            repository.put(id, updated);
            return updated;
        }
        return null;
    }

    public Instrument updatePosition(String id, int x, int y) {
        Instrument instrument = repository.get(id);
        if (instrument != null) {
            instrument.setX(x);
            instrument.setY(y);
        }
        return instrument;
    }
}